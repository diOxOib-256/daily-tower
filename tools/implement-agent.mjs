#!/usr/bin/env node
/**
* Daily Tower 実装エージェント（GitHub Actions 用）
*
* Gemini API の function calling で、Muse が精査した指示文に沿って
* リポジトリを編集する。コミットと push はワークフロー側が行う。
*
* ガードレール:
* - 書き込み可能なのは src/extensible/**、tests/**、および
* 指示文の「対象ファイル:」行に列挙されたファイルのみ
* - 実行できるコマンドは npm test / npm run build のみ
* - API 呼び出し回数に上限あり。finish ツールで終了し、コミット件名を書き出す
*
* 環境変数: GEMINI_API_KEY（必須）, GEMINI_MODEL（任意）, ISSUE_NUMBER（任意）
*/
import { execFile} from 'node:child_process';
import { promisify} from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const execFileP = promisify(execFile);
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-4-hydrogen';
const ISSUE_NUMBER = process.env.ISSUE_NUMBER || '';
const MAX_ROUNDS = 60;
const ROOT = process.cwd();

if (!API_KEY) {
console.error('GEMINI_API_KEY is not set');
process.exit(1);
}

const instructionRaw = fs.readFileSync(process.argv[2], 'utf8');
const blockMatch = instructionRaw.match(/([\s\S]*?)/);
const instruction = (blockMatch? blockMatch[1]: instructionRaw).trim();

// 対象ファイル（追加で書き込みを許可するファイル）の抽出
const listedFiles = new Set();
const listMatch = instruction.match(/対象ファイル[:：]\s*(.+)/);
if (listMatch) {
for (const f of listMatch[1].split(/[、,\s]+/).filter(Boolean)) {
listedFiles.add(f.replace(/^[「『"']/, '').replace(/[」』"']$/, ''));
}
}

function safeRel(rel) {
const p = path.normalize(String(rel)).replace(/\\/g, '/');
if (path.isAbsolute(rel) || p === '..' || p.startsWith('../')) {
throw new Error('不正なパスです: ' + rel);
}
return p;
}
function isWritable(rel) {
if (rel.startsWith('src/extensible/') || rel.startsWith('tests/')) return true;
return listedFiles.has(rel);
}
function guardWrite(rel) {
const p = safeRel(rel);
if (!isWritable(p)) {
throw new Error(
'書き込みが許可されていないパスです: ' + p +
'（許可範囲: src/extensible/**、tests/**、指示文の対象ファイル）'
);
}
return p;
}

const toolImpl = {
list_files({ dir}) {
const base = dir? safeRel(dir): '.';
const abs = path.join(ROOT, base);
const out = [];
const walk = (d, prefix, depth) => {
if (depth > 3 || out.length > 300) return;
for (const e of fs.readdirSync(d, { withFileTypes: true})) {
if (['node_modules', '.git', 'dist'].includes(e.name)) continue;
const rel = prefix? prefix + '/' + e.name: e.name;
out.push(e.isDirectory()? rel + '/': rel);
if (e.isDirectory()) walk(path.join(d, e.name), rel, depth + 1);
}
};
walk(abs, base === '.'? '': base, 0);
return out.join('\n') || '（空です）';
},
read_file({ path: rel}) {
const p = safeRel(rel);
const text = fs.readFileSync(path.join(ROOT, p), 'utf8');
if (text.length > 60000) {
return text.slice(0, 60000) + '\n…（以下省略。全 ' + text.length + ' 文字）';
}
return text;
},
write_file({ path: rel, content}) {
const p = guardWrite(rel);
const abs = path.join(ROOT, p);
fs.mkdirSync(path.dirname(abs), { recursive: true});
fs.writeFileSync(abs, content, 'utf8');
return '書き込みました: ' + p + '（' + content.length + ' 文字）';
},
edit_file({ path: rel, old_text, new_text}) {
const p = guardWrite(rel);
const abs = path.join(ROOT, p);
const text = fs.readFileSync(abs, 'utf8');
const first = text.indexOf(old_text);
if (first === -1) throw new Error('old_text が見つかりません: ' + p);
if (text.indexOf(old_text, first + 1)!== -1) {
throw new Error('old_text が複数箇所にあります。より長い範囲を指定してください: ' + p);
}
fs.writeFileSync(abs, text.slice(0, first) + new_text + text.slice(first + old_text.length), 'utf8');
return '編集しました: ' + p;
},
async run_tests() {
return runNpm(['test']);
},
async run_build() {
return runNpm(['run', 'build']);
},
};

async function runNpm(args) {
try {
const { stdout, stderr} = await execFileP('npm', args, {
cwd: ROOT, timeout: 900000, maxBuffer: 32 * 1024 * 1024,
});
return '終了コード 0\n' + tail(stdout + '\n' + stderr);
} catch (e) {
return '終了コード ' + (e.code?? '?') + '\n' + tail((e.stdout || '') + '\n' + (e.stderr || '') + '\n' + e.message);
}
}
function tail(s) {
const lines = s.split('\n');
return lines.slice(-80).join('\n');
}

const functionDeclarations = [
{ name: 'list_files', description: 'リポジトリ内のファイル一覧を返す（node_modules 等は除く）',
parameters: { type: 'OBJECT', properties: { dir: { type: 'STRING', description: '起点ディレクトリ（省略時はルート）'}}}},
{ name: 'read_file', description: 'ファイルの内容を読む',
parameters: { type: 'OBJECT', properties: { path: { type: 'STRING'}}, required: ['path']}},
{ name: 'write_file', description: 'ファイル全体を書き込む（新規作成・上書き）。許可範囲外はエラー',
parameters: { type: 'OBJECT', properties: { path: { type: 'STRING'}, content: { type: 'STRING'}}, required: ['path', 'content']}},
{ name: 'edit_file', description: 'old_text を new_text に置換する（old_text はファイル内で一意であること）',
parameters: { type: 'OBJECT', properties: { path: { type: 'STRING'}, old_text: { type: 'STRING'}, new_text: { type: 'STRING'}}, required: ['path', 'old_text', 'new_text']}},
{ name: 'run_tests', description: 'npm test を実行し、結果の末尾を返す',
parameters: { type: 'OBJECT', properties: {}}},
{ name: 'run_build', description: 'npm run build を実行し、結果の末尾を返す',
parameters: { type: 'OBJECT', properties: {}}},
{ name: 'finish', description: '実装が完了しテストが通ったら呼ぶ。コミット件名（日本語1行）と要約を返す',
parameters: { type: 'OBJECT', properties: { subject: { type: 'STRING'}, summary: { type: 'STRING'}}, required: ['subject', 'summary']}},
];

let agentGuide = '';
try { agentGuide = fs.readFileSync(path.join(ROOT, 'AGENT_GUIDE.md'), 'utf8');} catch { /* 任意 */}

const systemText = [
'あなたはブラウザゲーム「Daily Tower」の実装担当エージェントです。',
'Muse が精査した実装指示に厳密に従い、リポジトリを編集してください。',
'',
'厳守事項:',
'- 指示に書かれた内容だけを実装する。指示にない機能追加・改善・リファクタはしない',
'- AGENT_GUIDE.md の規約（ファイル配置、登録手順、数値の扱い）に従う',
'- src/core/** は、指示文の「対象ファイル:」に明示された場合のみ変更できる',
'- 新規の敵・アイテム・イベントには必ずスプライトを用意する（AGENT_GUIDE の手順通り）',
'- 実装後は run_tests を実行し、全件パスを確認する。失敗したら原因を直して再実行する',
'- 最後に必ず finish を呼び、コミット件名（日本語1行）と実装要約を返す',
'',
agentGuide? '=== AGENT_GUIDE.md ===\n' + agentGuide: '',
].join('\n');

const contents = [{
role: 'user',
parts: [{ text: '対象 Issue: #' + ISSUE_NUMBER + '\n\n=== 実装指示 ===\n' + instruction}],
}];

async function callGemini() {
const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
encodeURIComponent(MODEL) + ':generateContent';
const ctrl = new AbortController();
const timer = setTimeout(() => ctrl.abort(), 300000);
try {
const res = await fetch(url, {
method: 'POST',
signal: ctrl.signal,
headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY},
body: JSON.stringify({
systemInstruction: { parts: [{ text: systemText}]},
contents,
tools: [{ functionDeclarations}],
generationConfig: { temperature: 0.2},
}),
});
const data = await res.json();
if (!res.ok) {
throw new Error('Gemini API エラー HTTP ' + res.status + ': ' + JSON.stringify(data).slice(0, 500));
}
return data;
} finally {
clearTimeout(timer);
}
}

let finished = null;
for (let round = 1; round <= MAX_ROUNDS &&!finished; round++) {
const data = await callGemini();
const usage = data.usageMetadata || {};
console.log('[round ' + round + '] tokens in=' + (usage.promptTokenCount || '?') +
' out=' + (usage.candidatesTokenCount || '?'));
const parts = data.candidates?.[0]?.content?.parts || [];
contents.push({ role: 'model', parts});

const calls = parts.filter((p) => p.functionCall);
if (calls.length === 0) {
const textOut = parts.map((p) => p.text || '').join('');
console.error('モデルがツールを呼ばずに終了しました: ' + textOut.slice(0, 500));
process.exit(1);
}

const responses = [];
for (const part of calls) {
const { name, args} = part.functionCall;
console.log(' tool: ' + name + ' ' + JSON.stringify(args).slice(0, 160));
if (name === 'finish') {
finished = args;
responses.push({ functionResponse: { name, response: { result: '記録しました。終了します。'}}});
continue;
}
try {
const result = await toolImpl[name](args || {});
responses.push({ functionResponse: { name, response: { result: String(result).slice(0, 30000)}}});
} catch (e) {
responses.push({ functionResponse: { name, response: { result: 'エラー: ' + e.message}}});
}
}
contents.push({ role: 'function', parts: responses});
}

if (!finished) {
console.error('上限回数に達したため終了します（finish 未達）');
process.exit(1);
}

const subjectFile = path.join(process.env.RUNNER_TEMP || '/tmp', 'commit_subject.txt');
fs.writeFileSync(subjectFile, finished.subject + '\n', 'utf8');
console.log('FINISH subject: ' + finished.subject);
console.log('FINISH summary: ' + finished.summary);

// 전역 변수 (이전과 동일)
let CIPHER_DICT = null;
let DECODE_MAP = null;

// 한글 유니코드 상수 및 자모 목록 (이전과 동일)
const HANGUL_START_CODE = 44032;
const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSUNG_LIST = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSUNG_LIST = [' ', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// 복합 중성 (이중 모음) 매핑: [모음1, 모음2] -> 복합 모음
const COMPOUND_JUNG_MAP = {
    'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 
    'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 
    'ㅡㅣ': 'ㅢ'
};

// ----------------------------------------------------------------------
// 1. 초기화 및 JSON 로드 (fetch 사용) (이전과 동일)
// ----------------------------------------------------------------------
async function init() {
    const btnEncrypt = document.getElementById('btnEncrypt');
    const btnDecrypt = document.getElementById('btnDecrypt');

    btnEncrypt.disabled = true;
    btnDecrypt.disabled = true;

    try {
        const response = await fetch('./base.json'); 
        if (!response.ok) throw new Error(`파일 로드 실패: HTTP Status ${response.status}`);
        
        CIPHER_DICT = await response.json();
        DECODE_MAP = new Map();

        const addToMap = (obj) => {
            if (!obj) return;
            for (const [key, value] of Object.entries(obj)) {
                DECODE_MAP.set(value, key);
            }
        };
        addToMap(CIPHER_DICT.consonants);
        addToMap(CIPHER_DICT.vowels);
        addToMap(CIPHER_DICT.compound_final_consonants);
        addToMap(CIPHER_DICT.special_chars);

        console.log("Dictionary Loaded!");
        btnEncrypt.disabled = false;
        btnDecrypt.disabled = false;

    } catch (error) {
        console.error("Failed to load base.json:", error);
        alert(`암호 사전 파일(base.json) 로드 오류: ${error.message}\nGitHub 저장소에 파일이 정확한 이름으로 있는지 확인해주세요.`);
    }
}

// ----------------------------------------------------------------------
// 2. 암호화 로직 (이전과 동일)
// ----------------------------------------------------------------------
function encodeChar(char) {
    if (char === ' ') return 'SPACE_TOKEN';
    if (CIPHER_DICT.special_chars && CIPHER_DICT.special_chars[char]) return CIPHER_DICT.special_chars[char];

    const charCode = char.charCodeAt(0);
    if (charCode >= HANGUL_START_CODE && charCode <= 55203) {
        const unit = charCode - HANGUL_START_CODE;
        const jongIdx = unit % 28;
        const jungIdx = Math.floor((unit / 28)) % 21;
        const choIdx = Math.floor(unit / 28 / 21);

        const cho = CHOSUNG_LIST[choIdx];
        const jung = JUNGSUNG_LIST[jungIdx];
        const jong = JONGSUNG_LIST[jongIdx];

        // 복합 중성을 분리하여 인코딩
        let jungParts = [jung];
        if (jung === 'ㅘ') jungParts = ['ㅗ', 'ㅏ'];
        else if (jung === 'ㅙ') jungParts = ['ㅗ', 'ㅐ'];
        else if (jung === 'ㅚ') jungParts = ['ㅗ', 'ㅣ'];
        else if (jung === 'ㅝ') jungParts = ['ㅜ', 'ㅓ'];
        else if (jung === 'ㅞ') jungParts = ['ㅜ', 'ㅔ'];
        else if (jung === 'ㅟ') jungParts = ['ㅜ', 'ㅣ'];
        else if (jung === 'ㅢ') jungParts = ['ㅡ', 'ㅣ'];
        
        let parts = [CIPHER_DICT.consonants[cho]];
        
        // 중성 부분 인코딩
        for(const j of jungParts) {
            parts.push(CIPHER_DICT.vowels[j]);
        }

        if (jong !== ' ') {
            let jongCode;
            if (CIPHER_DICT.compound_final_consonants && CIPHER_DICT.compound_final_consonants[jong]) {
                jongCode = CIPHER_DICT.compound_final_consonants[jong];
            } else {
                jongCode = CIPHER_DICT.consonants[jong] || jong;
            }
            parts.push(jongCode);
        }
        return parts.join(CIPHER_DICT.separators.between_characters);
    }
    return char;
}

function encodeText(text) {
    if (!CIPHER_DICT) return "Dictionary Loading...";

    const encodedArray = Array.from(text).map(char => encodeChar(char));
    let result = [];
    
    for (let i = 0; i < encodedArray.length; i++) {
        const code = encodedArray[i];
        if (code === 'SPACE_TOKEN') {
            result.push(CIPHER_DICT.separators.between_words);
        } else {
            result.push(code);
            if (i < encodedArray.length - 1 && encodedArray[i+1] !== 'SPACE_TOKEN') {
                result.push(CIPHER_DICT.separators.between_characters);
            }
        }
    }
    return result.join('');
}


// ----------------------------------------------------------------------
// 3. 복호화 로직 및 자모 조합 (이중 모음 처리 추가)
// ----------------------------------------------------------------------
function decodeToJamos(encodedText) {
    let tokens = encodedText.split(CIPHER_DICT.separators.between_characters);
    return tokens.map(token => {
        if (token === '') return ' '; 
        return DECODE_MAP.get(token) || token;
    });
}

function combineJamos(jamos) {
    let result = "";
    let buffer = []; 

    const makeChar = (cho, jung, jong) => {
        const choIdx = CHOSUNG_LIST.indexOf(cho);
        const jungIdx = JUNGSUNG_LIST.indexOf(jung);
        const jongIdx = jong ? JONGSUNG_LIST.indexOf(jong) : 0;
        return String.fromCharCode(HANGUL_START_CODE + (choIdx * 21 * 28) + (jungIdx * 28) + jongIdx);
    };

    const flushBuffer = () => {
        if (buffer.length === 0) return;
        if (buffer.length === 1) result += buffer[0];
        else if (buffer.length >= 2) result += makeChar(buffer[0], buffer[1], buffer[2]);
        buffer = [];
    };
    
    // 유틸리티 함수
    const isCho = (c) => CHOSUNG_LIST.includes(c);
    const isJung = (c) => JUNGSUNG_LIST.includes(c);
    const isJong = (c) => JONGSUNG_LIST.includes(c) && c !== ' '; 
    const isCompoundJung = (j1, j2) => COMPOUND_JUNG_MAP[j1 + j2] !== undefined;
    
    for (let i = 0; i < jamos.length; i++) {
        const char = jamos[i];

        if (char === ' ' || (!isCho(char) && !isJung(char) && !isJong(char))) {
            flushBuffer();
            result += char;
            continue;
        }

        if (buffer.length === 0) { // []
            if (isCho(char)) buffer.push(char);
            else result += char; 
        } 
        else if (buffer.length === 1) { // [초성]
            if (isJung(char)) buffer.push(char);
            else { flushBuffer(); if (isCho(char)) buffer.push(char); else result += char; }
        } 
        else if (buffer.length === 2) { // [초성, 중성1]
            if (isJung(char)) {
                // 핵심 수정: 현재 모음(buffer[1])과 다음 모음(char)이 이중 모음을 만들 수 있는가?
                if (isCompoundJung(buffer[1], char)) {
                    buffer[1] = COMPOUND_JUNG_MAP[buffer[1] + char]; // 중성 업데이트 (예: 'ㅜ' -> 'ㅟ')
                } else {
                    flushBuffer();
                    buffer.push(char); // 새로운 글자의 시작으로 취급
                }
            } else if (isJong(char)) { // [초성, 중성, 종성] 또는 다음 글자의 초성 판단
                const nextChar = jamos[i + 1];
                if (nextChar && isJung(nextChar)) { 
                    flushBuffer(); buffer.push(char); 
                } else { 
                    buffer.push(char); 
                }
            } else { 
                flushBuffer(); 
                if (isCho(char)) buffer.push(char);
                else result += char;
            }
        } 
        else if (buffer.length === 3) { // [초, 중, 종]
            flushBuffer(); i--; 
        }
    }
    flushBuffer();
    return result;
}

function decodeText(encodedText) {
    const jamos = decodeToJamos(encodedText);
    return combineJamos(jamos);
}

// ----------------------------------------------------------------------
// 4. HTML과 연결되는 전역 이벤트 핸들러 (이전과 동일)
// ----------------------------------------------------------------------

function handleEncrypt() {
    if (!CIPHER_DICT) return;
    const inputText = document.getElementById('inputText').value;
    const result = encodeText(inputText);
    document.getElementById('outputText').value = result;
}

function handleDecrypt() {
    if (!CIPHER_DICT) return;
    const inputText = document.getElementById('inputText').value;
    const result = decodeText(inputText);
    document.getElementById('outputText').value = result;
}

function handleCopy() {
    const outputText = document.getElementById('outputText');
    if (outputText.value) {
        outputText.select();
        document.execCommand('copy');
        alert('복사되었습니다!');
    }
}

function handleDoc() {
  const a = document.createElement("a");
  a.href = "https://scriptedzero.github.io/docs/guide.pdf";
  a.download = "guide.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);1
}

// 5. 초기화 함수 실행
window.addEventListener('DOMContentLoaded', init);

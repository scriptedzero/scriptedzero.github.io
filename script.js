// 전역 변수
let CIPHER_DICT = null;
let DECODE_MAP = null;

// 한글 유니코드 상수 및 자모 목록 (이전과 동일)
const HANGUL_START_CODE = 44032;
const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSUNG_LIST = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSUNG_LIST = [' ', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// ----------------------------------------------------------------------
// 1. 초기화 및 JSON 로드 (fetch 사용)
// ----------------------------------------------------------------------
async function init() {
    const btnEncrypt = document.getElementById('btnEncrypt');
    const btnDecrypt = document.getElementById('btnDecrypt');

    // 초기에는 버튼을 비활성화하여 로드 전 클릭 방지
    btnEncrypt.disabled = true;
    btnDecrypt.disabled = true;

    try {
        const response = await fetch('./base.json'); 
        
        if (!response.ok) {
            throw new Error(`파일 로드 실패: HTTP Status ${response.status}`);
        }
        
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
        
        // 성공 시 버튼 활성화
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

        let parts = [CIPHER_DICT.consonants[cho], CIPHER_DICT.vowels[jung]];

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
// 3. 복호화 로직 및 자모 조합 (이전과 동일)
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

    const isCho = (c) => CHOSUNG_LIST.includes(c);
    const isJung = (c) => JUNGSUNG_LIST.includes(c);
    const isJong = (c) => JONGSUNG_LIST.includes(c) && c !== ' '; 

    for (let i = 0; i < jamos.length; i++) {
        const char = jamos[i];

        if (char === ' ' || (!isCho(char) && !isJung(char) && !isJong(char))) {
            flushBuffer();
            result += char;
            continue;
        }

        if (buffer.length === 0) {
            if (isCho(char)) buffer.push(char);
            else result += char; 
        } else if (buffer.length === 1) { 
            if (isJung(char)) buffer.push(char);
            else { flushBuffer(); if (isCho(char)) buffer.push(char); else result += char; }
        } else if (buffer.length === 2) { 
            if (isJong(char)) {
                const nextChar = jamos[i + 1];
                if (nextChar && isJung(nextChar)) { flushBuffer(); buffer.push(char); } 
                else { buffer.push(char); }
            } else if (isJung(char)) { flushBuffer(); result += char; } 
            else { flushBuffer(); if (isCho(char)) buffer.push(char); }
        } else if (buffer.length === 3) { 
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
// 4. HTML과 연결되는 전역 이벤트 핸들러 (새로 추가/수정된 부분)
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
        // execCommand는 보안상 권장되지 않으나 간단한 복사에는 유용
        outputText.select();
        document.execCommand('copy');
        alert('복사되었습니다!');
    }
}

// 5. 초기화 함수 실행 (페이지 로드 시 딱 한 번 실행)
window.addEventListener('DOMContentLoaded', init);

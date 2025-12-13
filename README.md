
# Fiverf: Hangul Cipher Utility

## 한국어

### 1. 소개

Fiverf는 한글 문자를 커스텀 모스 부호와 유사한 고유의 암호 체계로 변환하고, 이를 다시 복원하는 기능을 제공하는 웹 유틸리티입니다. 이 시스템은 초성, 중성, 종성을 분리하여 매핑하며, 띄어쓰기 및 복합 자음/모음도 정확히 처리할 수 있습니다.

### 2. 주요 기능

* **양방향 변환:** 일반 한글 텍스트를 암호문으로, 암호문을 다시 원본 한글 텍스트로 변환합니다.
* **띄어쓰기 유지:** 복호화 과정에서 단어 간의 띄어쓰기를 정확하게 유지합니다.
* **복잡한 한글 지원:** 겹받침('ㄳ', 'ㅄ') 및 이중 모음('ㅘ', 'ㅟ' 등)을 완벽하게 지원합니다.
* **특수 문자:** 일부 정의된 특수 문자(!, ?, @ 등)에 대한 변환 규칙을 포함합니다.

### 3. 기술 스택

| 항목 | 내용 |
| :--- | :--- |
| **언어** | HTML, CSS, JavaScript |
| **암호 사전** | `base.json` (Custom Cipher Definition) |
| **폰트** | SUIT Font |

### 4. 사용 방법 (개발자용)

본 유틸리티는 GitHub Pages 배포를 위해 설계되었습니다.

1.  **파일 구성:** 다음 4개 파일을 동일한 디렉토리에 배치합니다:
    * `index.html` (웹 페이지 구조 및 UI)
    * `style.css` (디자인 및 SUIT 폰트 정의)
    * `script.js` (암호화/복호화 로직)
    * `base.json` (암호 규칙 사전)
2.  **실행:** 웹 브라우저에서 `index.html` 파일을 열거나, GitHub Pages를 통해 배포합니다.

### 5. 암호 규칙의 예

| 한글 자모 | 암호 코드 | 설명 |
| :--- | :--- | :--- |
| ㄱ | `-` | 초성 'ㄱ' |
| ㅏ | `:>` | 중성 'ㅏ' |
| ㅂㅅ | `{**-* }{**-**}` | 겹받침 'ㅄ' |
| 띄어쓰기 | `  ` | 단어 간 구분자 |

---

## English

# Fiverf: Hangul Cipher Utility

### 1. Introduction

Fiverf is a simple web utility designed to encrypt and decrypt Hangul (Korean characters) into a unique, custom-defined cipher system similar to Morse code. This system works by decomposing Hangul characters into their individual jamo (consonants and vowels) and applying a specific code for each component.

### 2. Features

* **Bi-directional Conversion:** Converts plain Hangul text into the cipher code and vice versa.
* **Whitespace Preservation:** Accurately maintains spacing between words during the decoding process.
* **Full Hangul Support:** Supports complex jamo structures, including compound final consonants (e.g., 'ㄳ', 'ㅄ') and diphthongs (e.g., 'ㅘ', 'ㅟ').
* **Special Characters:** Includes defined encoding rules for several special characters (!, ?, @, etc.).

### 3. Tech Stack

| Component | Description |
| :--- | :--- |
| **Languages** | HTML, CSS, JavaScript |
| **Cipher Dictionary** | `base.json` (Custom Cipher Definition) |
| **Font** | SUIT Font |

### 4. How to Use (For Developers)

This utility is structured for easy deployment via platforms like GitHub Pages.

1.  **File Structure:** Ensure the following four files are placed in the same directory:
    * `index.html` (Web page structure and UI)
    * `style.css` (Styling and SUIT font definition)
    * `script.js` (Encryption/Decryption logic)
    * `base.json` (The custom cipher rule dictionary)
2.  **Deployment:** Open `index.html` in a web browser or deploy the directory contents using GitHub Pages.

### 5. Cipher Rule Example

| Hangul Jamo | Cipher Code | Description |
| :--- | :--- | :--- |
| ㄱ | `-` | Initial Consonant 'ㄱ' |
| ㅏ | `:>` | Vowel 'ㅏ' |
| ㅂㅅ | `{**-* }{**-**}` | Compound Final Consonant 'ㅄ' |
| Space | `  ` | Word Separator |
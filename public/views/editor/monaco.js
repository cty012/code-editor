"use strict";

const startCode = {
    java: "public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println(\"Hello World!\");\n\t}\n}\n",
    kotlin: "fun main() {\n\tprintln(\"Hello World!\")\n}\n"
}
const startLanguage = "java";
const startTheme = "vs-light";
var editor;

window.onload = () => {
    editor = monaco.editor.create(document.getElementById("editor"), {
        value: startCode[startLanguage],
        language: startLanguage,
        theme: startTheme,
        padding: {
            top: 20,
            bottom: 20
        },
        fontFamily: "Consolas",
        fontSize: 18,
        scrollBeyondLastLine: false,
        minimap: {
            enabled: false
        }
    });
}

const start_code = {
    java: "public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println(\"Hello World!\");\n\t}\n}\n",
    kotlin: "fun main() {\n\tprintln(\"Hello World!\")\n}\n"
}
const start_language = "java";
const start_theme = "vs-light";
var editor;

window.onload = () => {
    editor = monaco.editor.create(document.getElementById("editor"), {
        value: start_code[start_language],
        language: start_language,
        theme: start_theme,
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

    editor.addAction({
        id: 'convertIndentation',
        label: 'Convert indentation to space',
        contextMenuGroupId: 'control',
        run(IEditor) {
        const model = IEditor.getModel();
        if (model) {
            const preVal = model.getValue();
            let result = '';
            for (let i = 0; i < preVal.length; i++) {
            result += model.normalizeIndentation(preVal.charAt(i));
            }
            model.setValue(result);
        }
        },
    });

    getEditor();
}

function getEditor() {
    console.log(editor);
    return editor;
}

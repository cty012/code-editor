function switchTheme(isDark) {
    if (isDark) {
        document.body.classList.remove("dark");
        console.log(getEditor());
        getEditor().updateOptions({ theme: "vs-light" });
    } else {
        document.body.classList.add("dark");
        getEditor().updateOptions({ theme: "vs-dark" });
    }
    Array.prototype.forEach.call(document.getElementsByClassName('.dark-mode-btn-svg'), btnSvg => {
        btnSvg.style.color = isDark ? "#000000" : "#ffffff";
    });
}

function darkModeBtnOnClick() {
    isDark = document.body.classList.contains("dark");
    switchTheme(isDark);
}

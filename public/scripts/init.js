function startGame(uid) {
    //Move to a live game.
    window.location.href = "/live";
    //Set uid as a cookie.
    setCookie(uid);
}
function setCookie(cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = "uid" + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie() {
    let name = "uid" + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
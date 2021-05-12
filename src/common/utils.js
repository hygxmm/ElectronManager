const debounce = (fn, wait = 300) => {
    let timer = null;
    return function () {
        timer && clearTimeout(timer);
        timer = setTimeout(_ => {
            fn.apply(this, arguments);
        }, wait)
    }
}

module.exports = {
    debounce
}
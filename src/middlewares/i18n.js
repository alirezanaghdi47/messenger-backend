// libraries
const path = require("path");
const {I18n} = require("i18n");

const i18n = new I18n({
    locales: ["fa", "en"],
    directory: path.resolve("src", "locales"),
    defaultLocale: "fa",
});

module.exports = {
    i18n
}
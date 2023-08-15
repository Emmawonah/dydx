function random(len, alphabet) {
    let result = '';
    for (let i = 0; i < len; i++) {
      const x = Math.floor(Math.random() * alphabet.length)
      result += x;
    }
    return result;
}

module.exports = random
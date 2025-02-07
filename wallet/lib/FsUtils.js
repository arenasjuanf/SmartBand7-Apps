export class FsUtils {
	static writeText(fn, data) {
		if(!fn.startsWith("/storage")) fn = FsUtils.fullPath(fn);

		try {
			hmFS.remove(fn);
		} catch(e) {}

		const buffer = FsUtils.strToUtf8(data);
		const f = FsUtils.open(fn, hmFS.O_WRONLY | hmFS.O_CREAT);
		hmFS.write(f, buffer, 0, buffer.byteLength);
		hmFS.close(f);
	}

	static read(fn, limit=false) {
		if(!fn.startsWith("/storage")) fn = FsUtils.fullPath(fn);
		const [st, e] = FsUtils.stat(fn);
		const f = FsUtils.open(fn, hmFS.O_RDONLY);

		const size = limit ? limit : st.size;
		const data = new ArrayBuffer(size);
		hmFS.read(f, data, 0, size);
		hmFS.close(f);

		return data;
	}

	static fetchTextFile(fn, limit=false) {
		const data = FsUtils.read(fn, limit);

		const view = new Uint8Array(data);
		let str = "";

		return FsUtils.Utf8ArrayToStr(view);
	}

	static stat(path) {
      if(path.startsWith("/storage")) {
        const statPath = "../../../" + path.substring(9);
	      return hmFS.stat_asset(statPath);
      }

      return hmFS.stat_asset(path);
    }

	static open(path, m) {
      if(path.startsWith("/storage")) {
        const statPath = "../../../" + path.substring(9);
        return hmFS.open_asset(statPath, m);
      }

      return hmFS.open_asset(path, m);
	}

	static fetchJSON(fn) {
		const text = FsUtils.fetchTextFile(fn);
		return JSON.parse(text);
	}

	static getSelfPath() {
		return "/storage/js_apps/000049AA";
	}

	static fullPath(path) {
		return FsUtils.getSelfPath() + "/assets/" + path;
	}

	// https://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
	static strToUtf8(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        } else {
            i++;
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }

    return new Uint8Array(utf8).buffer;
	}

	// source: https://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript
	static Utf8ArrayToStr(array, limit=0) {
		var out, i, len, c;
		var char2, char3;

		out = "";
		len = limit > 0 ? limit : array.length;
		i = 0;
		while (i < len) {
			c = array[i++];
			switch (c >> 4) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					// 0xxxxxxx
					out += String.fromCharCode(c);
					break;
				case 12:
				case 13:
					// 110x xxxx   10xx xxxx
					char2 = array[i++];
					out += String.fromCharCode(
						((c & 0x1f) << 6) | (char2 & 0x3f)
					);
					break;
				case 14:
					// 1110 xxxx  10xx xxxx  10xx xxxx
					char2 = array[i++];
					char3 = array[i++];
					out += String.fromCharCode(
						((c & 0x0f) << 12) |
							((char2 & 0x3f) << 6) |
							((char3 & 0x3f) << 0)
					);
					break;
			}
		}

		return out;
	}
}

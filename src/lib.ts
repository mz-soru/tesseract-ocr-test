interface CountryType {
  [countryCode: string]: {
    name: string;
    regex: RegExp;
    splitBy: string;
  };
}
interface MaskingBlockType {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const countryValues: CountryType = {
  ben: {
    name: "bangladesh",
    regex: /\d{3}\s*\d{3}\s*\d{4}/,
    splitBy: " ",
  },
  kor: {
    name: "korea",
    regex: /[0-9]{6}-?[1-4][0-9]{6}/g,
    splitBy: " ",
  },
};

export const findIdNumber = (fullText: string, country: keyof CountryType) => {
  const matches = fullText.match(countryValues[country].regex);
  if (!matches) return null;
  return matches[0].split(countryValues[country].splitBy);
};

export const findIdNumberCoord = (
  lines: Tesseract.Line[],
  idNumbers: Array<string>
) => {
  const list = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.words.length; j++) {
      const word = line.words[j];
      if (idNumbers.includes(word.text)) {
        const value = {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
        };
        list.push(value);
      }
    }
  }
  return list;
};

export const maskingImage = async (
  image: string,
  idCoordList: MaskingBlockType[]
) => {
  if (image && idCoordList) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.src = image!;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    ctx.fillStyle = "black";
    idCoordList.forEach((coord) => {
      ctx.fillRect(coord.x, coord.y, coord.width, coord.height);
    });
    return canvas.toDataURL();
  }
};

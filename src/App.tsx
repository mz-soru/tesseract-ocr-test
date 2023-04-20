import React, { useState } from "react";
import Tesseract from "tesseract.js";
import {
  countryRegex,
  createMaskingImage,
  findIdNumber,
  findIdNumberCoord,
} from "./lib";

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>("");
  const [country, setCountry] = useState(Object.keys(countryRegex)[0]);
  const [progressValue, setProgressValue] = useState<number>(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleImageRecognition = async () => {
    if (image) {
      const lang = "eng";
      const { data } = await Tesseract.recognize(image, lang, {
        logger: (e) => {
          if (e.status === "recognizing text") setProgressValue(e.progress);
        },
      });

      const idNumber = findIdNumber(data.text, country);
      if (!idNumber) return;
      const { lines } = data;
      const coords = findIdNumberCoord(lines, idNumber);
      const maskedImage = await createMaskingImage(image, coords);
      setResult(maskedImage);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <select onChange={(e) => setCountry(e.target.value)}>
        {Object.keys(countryRegex).map((countryCode) => {
          return (
            <option value={countryCode} key={countryCode}>
              {countryCode}
            </option>
          );
        })}
      </select>
      <button onClick={handleImageRecognition}>Recognize</button>
      <progress value={progressValue} />
      {result && <img src={result} />}
    </div>
  );
}

export default App;

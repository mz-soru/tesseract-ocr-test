import React, { useState } from "react";
import Tesseract from "tesseract.js";
import {
  countryValues,
  maskingImage,
  findIdNumber,
  findIdNumberCoord,
} from "./lib";

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>("");
  const [country, setCountry] = useState(Object.keys(countryValues)[0]);
  const [progressValue, setProgressValue] = useState<number>(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const imageRecognition = async () => {
    if (!image) return;
    const { data } = await Tesseract.recognize(image, "eng", {
      logger: (e) => {
        if (e.status === "recognizing text") setProgressValue(e.progress);
      },
    });

    // image에서 정규식에 맞는 id number를 추출
    const idNumber = findIdNumber(data.text, country);

    if (!idNumber) {
      alert("이미지 확인에 실패했습니다. 다른 이미지를 넣어주세요");
      return;
    }
    const { lines } = data;
    // id number의 좌표값을 찾음
    const coords = findIdNumberCoord(lines, idNumber);

    // 좌표값에 마스킹
    const maskedImage = await maskingImage(image, coords);
    setResult(maskedImage);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept="image/*" />
      <select onChange={(e) => setCountry(e.target.value)}>
        {Object.keys(countryValues).map((countryCode) => {
          return (
            <option value={countryCode} key={countryCode}>
              {countryValues[countryCode].name}
            </option>
          );
        })}
      </select>
      <button onClick={imageRecognition}>Recognize</button>
      <progress value={progressValue} />
      {result && <img src={result} />}
    </div>
  );
}

export default App;

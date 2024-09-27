export const languageOptions = [
  { value: "en", label: "英語" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "ko", label: "韓語" },
  { value: "ja", label: "日語" },
  { value: "fr", label: "法語" },
  { value: "de", label: "德語" },
  { value: "es", label: "西班牙語" },
  { value: "th", label: "泰語" },
  { value: "it", label: "義大利語" },
  { value: "pt", label: "葡萄牙語" },
  { value: "others", label: "其他" },
];

export const defaultCardField = {
  fieldTemplateId: "defaultFieldTemplate1",
  userId: "default",
  templateName: "預設模板", //創建者自行命名
  frontFields: [
    {
      name: "單字 Vocabulary",
      type: "text",
      required: true, //驗證時是否為必填項
      position: { x: 150, y: 100 },
      style: {
        width: "300px", //容器寬度
        height: "200px", //容器高度
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333333",
        textAlign: "center",
      },
    },
  ],
  backFields: [
    {
      name: "字義 Definition",
      type: "text",
      required: true, //驗證時是否為必填項
      position: { x: 150, y: 100 },
      style: {
        width: "300px", //容器寬度
        height: "200px", //容器高度
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333333",
        textAlign: "center",
      },
    },
  ],
  createdAt: "2024-09-03T12:34:56Z", //資料庫時間
};

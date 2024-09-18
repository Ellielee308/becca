export const languageOptions = [
  { value: "english", label: "英語" },
  { value: "chinese", label: "中文" },
  { value: "korean", label: "韓語" },
  { value: "japanese", label: "日語" },
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

export const defaultCardFieldWithSentences = {
  fieldTemplateId: "", //填入docRef.id
  userId: "default",
  templateName: "正面附例句",
  frontFields: [
    {
      name: "單字 Vocabulary",
      type: "text",
      required: true,
      position: { x: 150, y: 80 },
      style: {
        width: "300px",
        height: "200px",
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333333",
        textAlign: "center",
      },
    },
    {
      name: "例句 This is a sentence.",
      type: "text",
      required: true,
      position: { x: 150, y: 200 },
      style: {
        width: "300px",
        height: "200px",
        fontSize: "18px",
        fontWeight: "normal",
        color: "#333333",
        textAlign: "left",
      },
    },
  ],
  backFields: [
    {
      name: "字義 Definition",
      type: "text",
      required: true,
      position: { x: 150, y: 100 },
      style: {
        width: "300px",
        height: "200px",
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333333",
        textAlign: "center",
      },
    },
  ],
  createdAt: "", //填入資料庫時間
};

export const defaultCardFieldWithImage = {
  fieldTemplateId: "", //填入docRef.id
  userId: "default",
  templateName: "背面附圖片",
  frontFields: [
    {
      name: "單字 Vocabulary",
      type: "text",
      required: true,
      position: { x: 150, y: 100 },
      style: {
        width: "300px",
        height: "200px",
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
      required: true,
      position: { x: 150, y: 50 },
      style: {
        width: "300px",
        height: "200px",
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333333",
        textAlign: "center",
      },
    },
    {
      name: "示意圖 Image",
      type: "image",
      required: false,
      position: { x: 230, y: 200 },
      style: {
        width: "150px",
        height: "150px",
        objectFit: "cover",
      },
    },
  ],
  createdAt: "",
};

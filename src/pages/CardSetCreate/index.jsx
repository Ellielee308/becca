import styled from "styled-components";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext.jsx";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { languageOptions } from "./testOptions.js";
import TemplatePreview from "./TemplatePreview.jsx";
import Preview from "./Preview.jsx";
import CardContent from "./CardContent.jsx";
import NewStyleModal from "./NewStyleModal.jsx";
import NewTemplateModal from "./NewTemplateModal.jsx";
import {
  getUserCardStyles,
  addNewLabel,
  getUserCardTemplates,
  uploadCardSetWithCards,
} from "../../utils/api.js";

function CardSetCreate() {
  const { user, updateUser } = useUser();
  const [labelOptions, setLabelOptions] = useState([]);
  const [allStyles, setAllStyles] = useState([]);
  const [styleOptions, setStyleOptions] = useState([]);
  const [showNewStyleModal, setShowNewStyleModal] = useState(false);
  const [selectedStyleOption, setSelectedStyleOption] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState({});
  const [allTemplates, setAllTemplates] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedTemplateOption, setSelectedTemplateOption] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);
  const [cardSetData, setCardSetData] = useState({
    cardSetId: "",
    userId: user ? user.userId : "",
    title: "",
    description: "",
    purpose: "",
    visibility: "",
    labels: [],
    styleId: "",
    fieldTemplateId: "",
    createdAt: "",
    cardOrder: [],
  });
  const [cardContent, setCardContent] = useState([]);

  useEffect(() => {
    if (
      selectedTemplate &&
      selectedTemplate.frontFields &&
      selectedTemplate.backFields
    ) {
      const newCardContent = Array(3) // 假設要產生3張卡片
        .fill(null)
        .map(() => ({
          frontFields: selectedTemplate.frontFields.map((field) => ({
            name: field.name,
            value: "", // 初始化為空值
          })),
          backFields: selectedTemplate.backFields.map((field) => ({
            name: field.name,
            value: "", // 初始化為空值
          })),
        }));
      setCardContent(newCardContent);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    console.log("目前的用戶資料：", user);
    if (user && user.labels) {
      const labelOptions = user.labels.map((label) => ({
        value: label,
        label: label,
      }));
      setLabelOptions(labelOptions);
    }
    if (user) {
      const fetchUserCardStyles = async () => {
        try {
          const userCardStyles = await getUserCardStyles(user.userId); // 等待異步結果
          console.log("用戶的卡片樣式：", userCardStyles);
          setAllStyles(userCardStyles);

          const cardStyleOptions = userCardStyles.map((userCardStyle) => ({
            value: userCardStyle.styleId,
            label: userCardStyle.styleName,
          }));
          setStyleOptions(cardStyleOptions);
        } catch (error) {
          console.error("獲取卡片樣式失敗：", error);
        }
      };
      fetchUserCardStyles();
      const fetchUserCardTemplates = async () => {
        try {
          const userCardTemplates = await getUserCardTemplates(user.userId);
          console.log("用戶的卡片模板(含預設)：", userCardTemplates);
          setAllTemplates(userCardTemplates);

          // 定義模板的排序順序
          const templateOrder = [
            "XWQvUaViTDuaBkbOu4Xp", // 預設模板
            "8bhVw68E1aFe0Q57Y9WZ", // 正面附例句
            "OmCVCwZgqjJ3Ntny8jWI", // 背面附圖片
          ];

          const cardTemplateOptions = userCardTemplates.map(
            (userCardTemplate) => ({
              value: userCardTemplate.fieldTemplateId,
              label: userCardTemplate.templateName,
            })
          );

          // 根據定義的順序排序選項
          cardTemplateOptions.sort((a, b) => {
            const orderA = templateOrder.indexOf(a.value);
            const orderB = templateOrder.indexOf(b.value);

            // 如果都在排序順序中，則按順序排
            if (orderA !== -1 && orderB !== -1) {
              return orderA - orderB;
            }
            // 如果只有一個在排序順序中，則讓它排在前面
            if (orderA !== -1) return -1;
            if (orderB !== -1) return 1;
            // 如果都不在排序順序中，保持原有順序
            return 0;
          });

          setTemplateOptions(cardTemplateOptions);
          const defaultTemplate = cardTemplateOptions.find(
            (option) => option.value === "XWQvUaViTDuaBkbOu4Xp" //預設模板
          );

          // 設置預設模板為選中的模板
          if (defaultTemplate) {
            setSelectedTemplateOption(defaultTemplate);
            setSelectedTemplate(
              userCardTemplates.find(
                (template) =>
                  template.fieldTemplateId === "XWQvUaViTDuaBkbOu4Xp"
              )
            );
            setCardSetData((prevInfo) => ({
              ...prevInfo,
              fieldTemplateId: "XWQvUaViTDuaBkbOu4Xp",
            }));
          }
        } catch (error) {
          console.error("獲取卡片模板失敗：", error);
        }
      };
      fetchUserCardTemplates();
    }
  }, [user]);

  const handleStyleChange = (selectedOption) => {
    if (selectedOption.value === "newStyle") {
      setShowNewStyleModal(true); // 當選擇「新增樣式…」時顯示 Modal
    } else {
      setSelectedStyleOption(selectedOption);
      const selectedStyleObject = allStyles.find(
        (style) => style.styleName === selectedOption.label
      );
      setSelectedStyle(selectedStyleObject);
      setCardSetData({ ...cardSetData, styleId: selectedOption.value });
    }
  };

  const handleStyleAdded = (newStyle, styleId) => {
    setAllStyles((prevStyles) => [...prevStyles, newStyle]);
    setStyleOptions((prevOptions) => [
      ...prevOptions,
      { value: styleId, label: newStyle.styleName },
    ]);
  };

  const handleCreateLabel = async (newLabel) => {
    try {
      await addNewLabel(newLabel, user.userId);
      console.log("標籤已新增至資料庫：", newLabel);
      const newOption = { value: newLabel, label: newLabel };
      setLabelOptions((prevOptions) => [...prevOptions, newOption]);
      setCardSetData((prevInfo) => ({
        ...prevInfo,
        labels: [...prevInfo.labels, newLabel],
      }));
      updateUser(user.userId);
    } catch (error) {
      console.error("新增標籤失敗：", error);
    }
  };

  const handleTemplateChange = (selectedOption) => {
    if (selectedOption.value === "newTemplate") {
      if (!selectedStyle.styleName) {
        alert("請先選擇樣式！");
        return;
      } else {
        setShowNewTemplateModal(true); // 當選擇「新增樣式…」時顯示 Modal}
      }
    } else {
      setSelectedTemplateOption(selectedOption);
      const selectedTemplateObject = allTemplates.find(
        (template) => template.templateName === selectedOption.label
      );
      setSelectedTemplate(selectedTemplateObject);
      setCardSetData({ ...cardSetData, fieldTemplateId: selectedOption.value });
    }
  };

  const handleTemplateAdded = (newTemplate, fieldTemplateId) => {
    setAllTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
    setTemplateOptions((prevOptions) => [
      ...prevOptions,
      { value: fieldTemplateId, label: newTemplate.templateName },
    ]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let newInvalidFields = [];

    if (cardSetData.title === "") {
      newInvalidFields.push("title");
    }
    if (cardSetData.purpose === "") {
      newInvalidFields.push("purpose");
    }
    if (cardSetData.visibility === "") {
      newInvalidFields.push("visibility");
    }
    if (cardSetData.styleId === "") {
      newInvalidFields.push("styleId");
    }
    if (cardSetData.fieldTemplateId === "") {
      newInvalidFields.push("fieldTemplateId");
    }
    if (cardSetData.purpose === "languageLearning") {
      if (!cardSetData.learningLanguage)
        newInvalidFields.push("learningLanguage");
      if (!cardSetData.interfaceLanguage)
        newInvalidFields.push("interfaceLanguage");
    }

    setInvalidFields(newInvalidFields);
    if (newInvalidFields.length > 0) return;
    //檢查卡牌組是否至少有一張
    if (cardContent.length < 1) {
      alert("字卡至少需要一張！");
      return;
    }
    // 檢驗正面是否必填格都有填
    for (let i = 0; i < selectedTemplate.frontFields.length; i++) {
      if (selectedTemplate.frontFields[i].required === true) {
        for (let y = 0; y < cardContent.length; y++) {
          // 檢查前端卡片的對應欄位是否有值
          if (
            !cardContent[y].frontFields[i] ||
            cardContent[y].frontFields[i].value.trim() === ""
          ) {
            alert("卡片有必填項未填！");
            return;
          }
        }
      }
    }
    // 檢驗背面是否必填格都有填
    for (let i = 0; i < selectedTemplate.backFields.length; i++) {
      if (selectedTemplate.backFields[i].required === true) {
        for (let y = 0; y < cardContent.length; y++) {
          // 檢查背面卡片的對應欄位是否有值
          if (
            !cardContent[y].backFields[i] ||
            cardContent[y].backFields[i].value.trim() === ""
          ) {
            alert("卡片有必填項未填！");
            return;
          }
        }
      }
    }
    //真正的提交邏輯
    try {
      await uploadCardSetWithCards(cardSetData, cardContent, user.userId);
      alert("卡牌組提交成功！");
      window.location.reload();
    } catch (error) {
      console.error("儲存過程出現錯誤：", error);
      alert("儲存失敗，請重試。");
    }
  };

  return (
    <Wrapper>
      <Heading>新增卡牌組</Heading>
      <Form onSubmit={handleSubmit}>
        <InputLabel>
          標題<RequiredNotice>*</RequiredNotice>
        </InputLabel>
        <Input
          type="text"
          onChange={(e) =>
            setCardSetData({ ...cardSetData, title: e.target.value })
          }
          isInvalid={invalidFields.includes("title")}
        />
        <InputLabel htmlFor="description">簡介</InputLabel>
        <Textarea
          id="description"
          onChange={(e) =>
            setCardSetData({ ...cardSetData, description: e.target.value })
          }
        />
        <InputLabel>
          目的
          <RequiredNotice>
            {`*${invalidFields.includes("purpose") ? " 必選項" : ""}`}
          </RequiredNotice>
        </InputLabel>
        <RadioWrapper>
          <InputRadio
            type="radio"
            id="languageLearning"
            name="purpose"
            value="languageLearning"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetData({ ...cardSetData, purpose: "languageLearning" });
            }}
          />
          <InputLabel htmlFor="languageLearning">語言學習</InputLabel>
          <InputRadio
            type="radio"
            id="others"
            name="purpose"
            value="others"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetData({
                  ...cardSetData,
                  purpose: "others",
                  learningLanguage: null,
                  interfaceLanguage: null,
                });
            }}
          />
          <InputLabel htmlFor="others">其他</InputLabel>
        </RadioWrapper>
        {cardSetData.purpose === "languageLearning" && (
          <>
            <InputLabel htmlFor="label">
              你想要學習的語言是什麼？<RequiredNotice>*</RequiredNotice>
            </InputLabel>
            <Select
              options={languageOptions}
              onChange={(selectedOption) =>
                setCardSetData({
                  ...cardSetData,
                  learningLanguage: selectedOption.value,
                })
              }
              styles={selectStyles(invalidFields.includes("learningLanguage"))}
            />
            <InputLabel htmlFor="label">
              你想要以什麼語言學習呢？<RequiredNotice>*</RequiredNotice>
            </InputLabel>
            <Select
              options={languageOptions}
              onChange={(selectedOption) =>
                setCardSetData({
                  ...cardSetData,
                  interfaceLanguage: selectedOption.value,
                })
              }
              styles={selectStyles(invalidFields.includes("interfaceLanguage"))}
            />
          </>
        )}
        <InputLabel>
          隱私
          <RequiredNotice>
            {`*${invalidFields.includes("visibility") ? " 必選項" : ""}`}
          </RequiredNotice>
        </InputLabel>
        <RadioWrapper>
          <InputRadio
            type="radio"
            id="public"
            name="visibility"
            value="public"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetData({ ...cardSetData, visibility: "public" });
            }}
            isInvalid={invalidFields.includes("visibility")}
          />
          <InputLabel htmlFor="public">公開</InputLabel>
          <InputRadio
            type="radio"
            id="private"
            name="visibility"
            value="private"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetData({ ...cardSetData, visibility: "private" });
            }}
            isInvalid={invalidFields.includes("visibility")}
          />
          <InputLabel htmlFor="private">私人</InputLabel>
        </RadioWrapper>
        <InputLabel htmlFor="label">標籤 (可複選) </InputLabel>
        <CreatableSelect
          id="label"
          isMulti
          options={labelOptions}
          value={labelOptions.filter((option) =>
            cardSetData.labels.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            setCardSetData({
              ...cardSetData,
              labels: selectedOptions
                ? selectedOptions.map((opt) => opt.value)
                : [],
            });
          }}
          onCreateOption={handleCreateLabel} // 當創建新標籤時調用的處理程序
        />
        <InputLabel>
          樣式<RequiredNotice>*</RequiredNotice>
        </InputLabel>
        <Select
          options={[
            ...styleOptions,
            { value: "newStyle", label: "新增樣式..." },
          ]}
          value={selectedStyleOption}
          onChange={handleStyleChange}
          styles={selectStyles(invalidFields.includes("styleId"))}
        />
        <InputLabel>
          模板<RequiredNotice>*</RequiredNotice>
        </InputLabel>
        <Select
          options={[
            ...templateOptions,
            { value: "newTemplate", label: "新增模板..." },
          ]}
          value={selectedTemplateOption}
          onChange={handleTemplateChange}
          styles={selectStyles(invalidFields.includes("fieldTemplateId"))}
        />
        <TemplatePreview currentTemplate={selectedTemplate} />
        <InputLabel>預覽</InputLabel>
        {selectedStyle.styleName && (
          <Preview
            currentStyle={selectedStyle}
            currentTemplate={selectedTemplate}
          />
        )}
        <InputLabel>
          字卡內容 (至少需要一張字卡)<RequiredNotice>*</RequiredNotice>
        </InputLabel>
        <CardContent
          currentTemplate={selectedTemplate}
          cardContent={cardContent}
          setCardContent={setCardContent}
        />
        <Submit type="submit" value="儲存" />
      </Form>
      {showNewStyleModal && (
        <NewStyleModal
          onClose={() => {
            setShowNewStyleModal(false);
            setSelectedStyleOption(null); // 重置選擇器為未選擇狀態
            setSelectedStyle({});
            setCardSetData({ ...cardSetData, styleId: "" });
          }}
          onStyleAdded={handleStyleAdded}
        />
      )}
      {showNewTemplateModal && (
        <NewTemplateModal
          currentStyle={selectedStyle}
          onClose={() => {
            setShowNewTemplateModal(false);
            const defaultTemplate = templateOptions.find(
              (option) => option.value === "XWQvUaViTDuaBkbOu4Xp"
            );

            // 設置預設模板為選中的模板
            if (defaultTemplate) {
              setSelectedTemplateOption(defaultTemplate);
              setSelectedTemplate(
                allTemplates.find(
                  (template) =>
                    template.fieldTemplateId === "XWQvUaViTDuaBkbOu4Xp"
                )
              );
            }
            setCardSetData({ ...cardSetData, fieldTemplateId: "" });
          }}
          onTemplateAdded={handleTemplateAdded}
        />
      )}
    </Wrapper>
  );
}

export default CardSetCreate;

const Wrapper = styled.div`
  margin: 60px auto;
  padding: 30px 20px;
  max-width: 1160px;
  border: 1px solid black;
`;

const Heading = styled.h2`
  padding-bottom: 30px;
  font-size: 32px;
  user-select: none;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled.label`
  margin-top: 12px;
  margin-bottom: 12px;
  font-size: 18px;

  &:first-of-type {
    margin-top: 0px;
  }
`;

const RequiredNotice = styled.span`
  margin-left: 5px;
  color: red;
`;

const Input = styled.input`
  height: 36px;
  padding: 0px 5px;
  border: ${(props) =>
    props.isInvalid ? "solid 1px red" : "solid 1px #c1c0c0"};
  border-radius: 4px;
  font-size: 18px;
  &:focus {
    outline: 2px solid #2684ff;
  }
`;

const Textarea = styled.textarea`
  font-family: "Noto Sans TC", sans-serif;
  height: 130px;
  padding: 5px;
  border-radius: 4px;
  border: solid 1px #c1c0c0;
  outline: none;
  font-size: 18px;
  &:focus {
    outline: 2px solid #2684ff;
  }
`;

const InputRadio = styled.input`
  margin-right: 10px;
  margin-left: 10px;
  &:first-of-type {
    margin-left: 0px;
  }
`;

const RadioWrapper = styled.div``;

const Submit = styled.input`
  margin-top: 10px;
  align-self: center;
  width: 128px;
  height: 40px;
  font-size: 16px;
  line-height: 16px;
  font-family: "Noto Sans TC", sans-serif;
`;

const selectStyles = (isInvalid) => ({
  control: (provided, state) => ({
    ...provided,
    borderColor: isInvalid ? "red" : provided.borderColor,
    "&:hover": {
      borderColor: isInvalid
        ? "red"
        : state.isFocused
        ? provided.borderColor
        : provided.borderColor,
    },
  }),
});

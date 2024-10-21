import { ConfigProvider, message, Result, Skeleton, Steps } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import styled from "styled-components";
import { CardSetCreateEditIcon } from "../../assets/icons";
import NewStyleModal from "../../components/NewStyleModal";
import Preview from "../../components/Preview";
import { useUser } from "../../context/UserContext.jsx";
import {
  addNewLabel,
  getUserCardStyles,
  getUserCardTemplates,
  getUserLabels,
  uploadCardSetWithCards,
} from "../../utils/api.js";
import CardContent from "./CardContent.jsx";
import NewTemplateModal from "./NewTemplateModal.jsx";
import TemplatePreview from "./TemplatePreview.jsx";

function CardSetCreate() {
  const { user, loading } = useUser();
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
  const [cardContent, setCardContent] = useState([]);
  const [suggestedTranslations, setSuggestedTranslations] = useState([]);
  const [step, setStep] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [newCardSetId, setNewCardSetId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [cardSetData, setCardSetData] = useState({
    cardSetId: "",
    userId: "",
    title: "國中英文B2U5",
    description: "康軒版國中英文第二冊第五課",
    purpose: "",
    visibility: "",
    labels: [],
    styleId: "",
    fieldTemplateId: "",
    createdAt: "",
    cardOrder: [],
    labelNames: [],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    if (
      selectedTemplate &&
      selectedTemplate.frontFields &&
      selectedTemplate.backFields
    ) {
      const newCardContent = Array(3)
        .fill(null)
        .map(() => ({
          frontFields: selectedTemplate.frontFields.map((field) => ({
            name: field.name,
            value: "",
          })),
          backFields: selectedTemplate.backFields.map((field) => ({
            name: field.name,
            value: "",
          })),
        }));
      setCardContent(newCardContent);
      setSuggestedTranslations([]);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (user) {
      const fetchUserCardStyles = async () => {
        try {
          const userCardStyles = await getUserCardStyles(user.userId);
          setAllStyles(userCardStyles);

          const cardStyleOptions = userCardStyles.map((userCardStyle) => ({
            value: userCardStyle.styleId,
            label: userCardStyle.styleName,
          }));

          const defaultStyleId = "rvM8Fc1efHo7Ho7kf1gT";
          cardStyleOptions.sort((a, b) => {
            if (a.value === defaultStyleId) return -1;
            if (b.value === defaultStyleId) return 1;
            return 0;
          });
          setStyleOptions(cardStyleOptions);

          const defaultStyle = cardStyleOptions.find(
            (option) => option.value === defaultStyleId
          );
          if (defaultStyle) {
            setSelectedStyleOption(defaultStyle);
            setSelectedStyle(
              userCardStyles.find(
                (style) => style.styleId === "rvM8Fc1efHo7Ho7kf1gT"
              )
            );
            setCardSetData((prevInfo) => ({
              ...prevInfo,
              styleId: defaultStyleId,
            }));
          }
        } catch (error) {
          console.error("獲取卡片樣式失敗：", error);
        }
      };
      fetchUserCardStyles();

      const fetchUserCardTemplates = async () => {
        try {
          const userCardTemplates = await getUserCardTemplates(user.userId);
          setAllTemplates(userCardTemplates);

          const templateOrder = [
            "nHtBt7t26umO6NPqP4YC",
            "GTpFoUK1bYzNEeniNTbr",
            "0Z4xgB2uBqUJIgmRXuTi",
          ];

          const cardTemplateOptions = userCardTemplates.map(
            (userCardTemplate) => ({
              value: userCardTemplate.fieldTemplateId,
              label: userCardTemplate.templateName,
            })
          );

          cardTemplateOptions.sort((a, b) => {
            const orderA = templateOrder.indexOf(a.value);
            const orderB = templateOrder.indexOf(b.value);

            if (orderA !== -1 && orderB !== -1) {
              return orderA - orderB;
            }

            if (orderA !== -1) return -1;
            if (orderB !== -1) return 1;
            return 0;
          });

          setTemplateOptions(cardTemplateOptions);
          const defaultTemplate = cardTemplateOptions.find(
            (option) => option.value === "nHtBt7t26umO6NPqP4YC"
          );

          if (defaultTemplate) {
            setSelectedTemplateOption(defaultTemplate);
            setSelectedTemplate(
              userCardTemplates.find(
                (template) =>
                  template.fieldTemplateId === "nHtBt7t26umO6NPqP4YC"
              )
            );
            setCardSetData((prevInfo) => ({
              ...prevInfo,
              userId: user.userId,
              fieldTemplateId: "nHtBt7t26umO6NPqP4YC",
            }));
          }
        } catch (error) {
          console.error("獲取卡片模板失敗：", error);
        }
      };
      fetchUserCardTemplates();
      const fetchUserLabels = async () => {
        try {
          const userLabels = await getUserLabels(user.userId);
          const labelOptions = userLabels.map((label) => ({
            value: label.labelId,
            label: label.name,
          }));
          setLabelOptions(labelOptions);
        } catch (error) {
          console.error("獲取用戶標籤失敗：", error);
        }
      };
      fetchUserLabels();
    }
  }, [user]);

  const handleStyleChange = (selectedOption) => {
    if (selectedOption.value === "newStyle") {
      setShowNewStyleModal(true);
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
    setSelectedStyleOption({ value: styleId, label: newStyle.styleName });
    setSelectedStyle(newStyle);
    setCardSetData({ ...cardSetData, styleId: styleId });
  };

  const handleCreateLabel = async (newLabel) => {
    const isLabelExist = labelOptions.some(
      (option) => option.label.toLowerCase() === newLabel.toLowerCase()
    );

    if (isLabelExist) {
      messageApi.error("標籤已存在，不允許重複創建");
      return;
    }

    const specialCharRegex = /^[\p{L}\p{N}\s]+$/u;
    if (!specialCharRegex.test(newLabel)) {
      messageApi.error("標籤名稱含有不允許的特殊字元，創建失敗");
      return;
    }
    try {
      const newLabelId = await addNewLabel({
        name: newLabel,
        createdBy: user.userId,
      });
      const newOption = { value: newLabelId, label: newLabel };
      setLabelOptions((prevOptions) => [...prevOptions, newOption]);

      setCardSetData((prevInfo) => ({
        ...prevInfo,
        labels: [...prevInfo.labels, { labelId: newLabelId, name: newLabel }],
        labelNames: [...prevInfo.labelNames, newLabel],
      }));
    } catch (error) {
      console.error("新增標籤失敗：", error);
    }
  };

  const handleTemplateChange = (selectedOption) => {
    if (selectedOption.value === "newTemplate") {
      if (!selectedStyle.styleName) {
        message.warning("請先選擇樣式！");
        return;
      } else {
        setShowNewTemplateModal(true);
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
    setSelectedTemplateOption({
      value: fieldTemplateId,
      label: newTemplate.templateName,
    });
    setSelectedTemplate(newTemplate);
    setCardSetData({ ...cardSetData, fieldTemplateId: fieldTemplateId });
  };

  const handleFirstStepSubmit = (event) => {
    event.preventDefault();
    let newInvalidFields = [];

    if (cardSetData.title.trim() === "") {
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
    if (newInvalidFields.length === 0) {
      setStep(1);
    }
  };

  const handleFinalSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    if (cardContent.length < 1) {
      messageApi.warning("字卡至少需要一張！");
      return;
    }

    for (let i = 0; i < selectedTemplate.frontFields.length; i++) {
      if (selectedTemplate.frontFields[i].required === true) {
        for (let y = 0; y < cardContent.length; y++) {
          if (
            !cardContent[y].frontFields[i] ||
            cardContent[y].frontFields[i].value.trim() === ""
          ) {
            messageApi.error("卡片有必填項未填！");
            return;
          }
        }
      }
    }

    for (let i = 0; i < selectedTemplate.backFields.length; i++) {
      if (selectedTemplate.backFields[i].required === true) {
        for (let y = 0; y < cardContent.length; y++) {
          if (
            !cardContent[y].backFields[i] ||
            cardContent[y].backFields[i].value.trim() === ""
          ) {
            messageApi.error("卡片有必填項未填！");
            return;
          }
        }
      }
    }
    setIsSaving(true);
    try {
      messageApi.loading({
        content: "提交中，請稍候...",
        duration: 0,
      });
      const newCardSetId = await uploadCardSetWithCards(
        cardSetData,
        cardContent,
        user.userId
      );
      setNewCardSetId(newCardSetId);

      messageApi.destroy();
      messageApi.success("卡牌組提交成功！");
      setStep(2);
      setIsSaving(false);
    } catch (error) {
      messageApi.destroy();
      messageApi.error("儲存失敗，請重試。");
      console.error("儲存過程出現錯誤：", error);
      setIsSaving(false);
    }
  };

  if (!user || loading || !labelOptions || !allStyles || !allTemplates) {
    return (
      <SkeletonWrapper>
        <Skeleton
          active
          title={{ width: 200 }}
          paragraph={{ rows: 3, width: [200, 250, 180] }}
          style={{ width: "100%" }}
        />
        <SkeletonButtonWrapper>
          <Skeleton.Button style={{ width: 120, height: 50 }} active />
          <Skeleton.Button style={{ width: 120, height: 50 }} active />
        </SkeletonButtonWrapper>
      </SkeletonWrapper>
    );
  }
  return (
    <ConfigProvider theme={customTheme}>
      {contextHolder}
      <Background>
        <Wrapper>
          {step === 0 && (
            <>
              <HeadingContainer>
                <Heading>
                  <CardSetCreateEditIcon />
                  <p>新增卡牌組</p>
                </Heading>
                <NextStepButton
                  type="submit"
                  onClick={handleFirstStepSubmit}
                  value="下一步"
                />
              </HeadingContainer>
              <Steps
                current={step}
                items={[
                  {
                    title: "基本資料",
                  },
                  {
                    title: "字卡內容",
                  },
                  {
                    title: "完成新增卡牌組",
                  },
                ]}
              />
              <Form onSubmit={handleFirstStepSubmit}>
                <CardSetInfo>
                  <InputLabel htmlFor="title">
                    標題<RequiredNotice>*</RequiredNotice>
                  </InputLabel>
                  <Input
                    type="text"
                    onChange={(e) =>
                      setCardSetData({ ...cardSetData, title: e.target.value })
                    }
                    $isInvalid={invalidFields.includes("title")}
                    id="title"
                    placeholder="請輸入標題"
                    value={cardSetData.title}
                  />
                  <InputLabel htmlFor="description">簡介</InputLabel>
                  <Textarea
                    id="description"
                    onChange={(e) =>
                      setCardSetData({
                        ...cardSetData,
                        description: e.target.value,
                      })
                    }
                    placeholder="請輸入簡介"
                    value={cardSetData.description}
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
                          setCardSetData({
                            ...cardSetData,
                            purpose: "languageLearning",
                          });
                      }}
                      checked={cardSetData.purpose === "languageLearning"}
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
                      checked={cardSetData.purpose === "others"}
                    />
                    <InputLabel htmlFor="others">其他</InputLabel>
                  </RadioWrapper>
                  {cardSetData.purpose === "languageLearning" && (
                    <>
                      <InputLabel>
                        正面字卡顯示的語言
                        <RequiredNotice>*</RequiredNotice>
                      </InputLabel>
                      <Select
                        options={languageOptions}
                        onChange={(selectedOption) =>
                          setCardSetData({
                            ...cardSetData,
                            learningLanguage: selectedOption.value,
                          })
                        }
                        styles={selectStyles(
                          invalidFields.includes("learningLanguage")
                        )}
                        placeholder="請選擇語言"
                        value={languageOptions.find(
                          (option) =>
                            option.value === cardSetData.learningLanguage
                        )}
                      />
                      <InputLabel>
                        背面字卡顯示的語言
                        <RequiredNotice>*</RequiredNotice>
                      </InputLabel>
                      <Select
                        options={languageOptions}
                        onChange={(selectedOption) =>
                          setCardSetData({
                            ...cardSetData,
                            interfaceLanguage: selectedOption.value,
                          })
                        }
                        styles={selectStyles(
                          invalidFields.includes("interfaceLanguage")
                        )}
                        placeholder="請選擇語言"
                        value={languageOptions.find(
                          (option) =>
                            option.value === cardSetData.interfaceLanguage
                        )}
                      />
                    </>
                  )}
                  <InputLabel>
                    隱私
                    <RequiredNotice>
                      {`*${
                        invalidFields.includes("visibility") ? " 必選項" : ""
                      }`}
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
                          setCardSetData({
                            ...cardSetData,
                            visibility: "public",
                          });
                      }}
                      $isInvalid={invalidFields.includes("visibility")}
                      checked={cardSetData.visibility === "public"}
                    />
                    <InputLabel htmlFor="public">公開</InputLabel>
                    <InputRadio
                      type="radio"
                      id="private"
                      name="visibility"
                      value="private"
                      onChange={(e) => {
                        if (e.target.checked)
                          setCardSetData({
                            ...cardSetData,
                            visibility: "private",
                          });
                      }}
                      $isInvalid={invalidFields.includes("visibility")}
                      checked={cardSetData.visibility === "private"}
                    />
                    <InputLabel htmlFor="private">私人</InputLabel>
                  </RadioWrapper>
                  <InputLabel htmlFor="label">標籤 (可複選) </InputLabel>
                  <CreatableSelect
                    id="label"
                    isMulti
                    options={labelOptions}
                    value={labelOptions.filter((option) =>
                      cardSetData.labels.some(
                        (label) => label.labelId === option.value
                      )
                    )}
                    onChange={(selectedOptions) => {
                      setCardSetData({
                        ...cardSetData,
                        labels: selectedOptions
                          ? selectedOptions.map((opt) => ({
                              labelId: opt.value,
                              name: opt.label,
                            }))
                          : [],
                        labelNames: selectedOptions
                          ? selectedOptions.map((opt) => opt.label)
                          : [],
                      });
                    }}
                    onCreateOption={handleCreateLabel}
                    placeholder="請輸入或選擇標籤"
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
                    styles={selectStyles(
                      invalidFields.includes("fieldTemplateId")
                    )}
                  />
                </CardSetInfo>
                {selectedTemplate && selectedTemplate.templateName && (
                  <TemplatePreview currentTemplate={selectedTemplate} />
                )}
                <InputLabel>預覽</InputLabel>
                {selectedStyle.styleName && selectedTemplate.templateName && (
                  <Preview
                    currentStyle={selectedStyle}
                    currentTemplate={selectedTemplate}
                  />
                )}
                <Submit type="submit" value="下一步填寫字卡內容" />
              </Form>
            </>
          )}
          {step === 1 && (
            <>
              <HeadingContainer>
                <Heading>
                  <CardSetCreateEditIcon />
                  <p>新增卡牌組</p>
                </Heading>
                <UpperButtonGroup>
                  <UpperPreviousStepButton
                    onClick={() => {
                      setStep(0);
                    }}
                  >
                    上一步
                  </UpperPreviousStepButton>
                  <NextStepButton
                    type="submit"
                    onClick={handleFinalSubmit}
                    value="儲存"
                  />
                </UpperButtonGroup>
              </HeadingContainer>
              <Steps
                current={step}
                items={[
                  {
                    title: "基本資料",
                  },
                  {
                    title: "字卡內容",
                  },
                  {
                    title: "完成新增卡牌組",
                  },
                ]}
              />
              <Form onSubmit={handleFinalSubmit}>
                <InputLabel>
                  字卡內容 (至少需要一張字卡)<RequiredNotice>*</RequiredNotice>
                </InputLabel>
                <CardContent
                  currentTemplate={selectedTemplate}
                  cardContent={cardContent}
                  setCardContent={setCardContent}
                  isPurposeLanguageLearning={
                    cardSetData.purpose === "languageLearning"
                  }
                  interfaceLanguage={cardSetData.interfaceLanguage}
                  suggestedTranslations={suggestedTranslations}
                  setSuggestedTranslations={setSuggestedTranslations}
                />
                <ButtonGroup>
                  <PreviousStepButton
                    onClick={() => {
                      setStep(0);
                    }}
                  >
                    上一步
                  </PreviousStepButton>
                  <Submit type="submit" value="儲存" />
                </ButtonGroup>
              </Form>
            </>
          )}
          {step === 2 && (
            <>
              <HeadingContainer>
                <Heading>
                  <CardSetCreateEditIcon />
                  <p>新增卡牌組</p>
                </Heading>
              </HeadingContainer>
              <Steps
                current={step}
                items={[
                  {
                    title: "基本資料",
                  },
                  {
                    title: "字卡內容",
                  },
                  {
                    title: "完成新增卡牌組",
                  },
                ]}
              />
              <ResultWrapper>
                <Result status="success" title="成功新增牌組！" />
                <ResultButtonGroup>
                  <GoToCardSetLink to={`/cardset/${newCardSetId}`}>
                    前往卡牌組
                  </GoToCardSetLink>
                  <GoToMyCardSetsLink to={"/user/me/cardsets"}>
                    我的卡牌組頁面
                  </GoToMyCardSetsLink>
                </ResultButtonGroup>
              </ResultWrapper>
            </>
          )}
          {showNewStyleModal && styleOptions && (
            <NewStyleModal
              onClose={() => {
                setShowNewStyleModal(false);
              }}
              onStyleAdded={handleStyleAdded}
              styleNames={styleOptions.map((option) => option.label)}
            />
          )}
          {showNewTemplateModal && (
            <NewTemplateModal
              currentStyle={selectedStyle}
              onClose={() => {
                setShowNewTemplateModal(false);
              }}
              onTemplateAdded={handleTemplateAdded}
              templateNames={templateOptions.map((option) => option.label)}
            />
          )}
        </Wrapper>
      </Background>
    </ConfigProvider>
  );
}

const languageOptions = [
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

const customTheme = {
  token: {
    colorPrimary: "#3d5a80",
    borderRadius: 8,
    fontFamily: "'TaiwanPearl-Regular', 'Noto Sans TC', sans-serif;",
    fontSize: 16,
  },
};

export default CardSetCreate;

const Background = styled.div`
  background-color: #eff7ff;
  width: 100%;
  height: fit-content;
  padding: 80px 20px 20px 20px;
`;

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 30px 20px;
  max-width: 1160px;
  border: 1px solid #e6e3e1;
  border-radius: 8px;
  background-color: white;
`;

const Heading = styled.h2`
  padding-bottom: 30px;
  user-select: none;
  font-weight: 400;
  font-size: 32px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  white-space: pre-line;
  color: #293241;
  display: flex;
  gap: 12px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
`;

const CardSetInfo = styled.div`
  display: flex;
  flex-direction: column;
  @media only screen and (min-width: 640px) {
    display: grid;
    gap: 15px;
    grid-template-columns: 1fr 4fr;
    align-items: center;
  }
`;

const InputLabel = styled.label`
  margin-top: 12px;
  margin-bottom: 12px;
  font-size: 18px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
`;

const RequiredNotice = styled.span`
  margin-left: 5px;
  color: red;
  font-size: 16px;
`;

const Input = styled.input`
  height: 36px;
  padding: 0px 5px;
  border: none;
  border-bottom: ${(props) =>
    props.$isInvalid ? "solid 1px red" : "solid 1px #c1c0c0"};
  font-size: 14px;
  &:focus {
    outline: none;
  }
  font-family: "Noto Sans TC", sans-serif;
`;

const Textarea = styled.textarea`
  font-family: "Noto Sans TC", sans-serif;
  height: 130px;
  padding: 5px;
  border-radius: 4px;
  border: solid 1px #c1c0c0;
  outline: none;
  font-size: 14px;
  &:focus {
    outline: none;
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
  padding: 0 14px;
  margin-top: 20px;
  align-self: center;
  min-width: 128px;
  height: 45px;
  font-size: 16px;
  line-height: 16px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 500px;
  justify-content: space-around;
  @media only screen and (max-width: 639px) {
    width: 100%;
  }
`;

const PreviousStepButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 14px;
  margin-top: 20px;
  min-width: 128px;
  height: 45px;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  cursor: pointer;
`;

const HeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: start;
`;

const NextStepButton = styled.input`
  width: 90px;
  height: 36px;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  text-align: center;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const UpperButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 36px;
  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const UpperPreviousStepButton = styled.div`
  width: 90px;
  height: 36px;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const ResultWrapper = styled.div`
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ResultButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 32px;
  width: 360px;
  justify-content: space-around;
  @media only screen and (max-width: 549px) {
    width: 80%;
  }
`;

const GoToCardSetLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 50px;
  font-size: 16px;
  font-weight: 400;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  text-decoration: none;
  @media only screen and (max-width: 479px) {
    font-size: 14px;
  }
`;

const GoToMyCardSetsLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 50px;
  font-size: 16px;
  font-weight: 400;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: #666;
  background-color: #e0e0e0;
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  margin-left: 16px;
  text-decoration: none;
  &:hover {
    background-color: #d3d3d3;
  }
  &:active {
    background-color: #c0c0c0;
  }
  @media only screen and (max-width: 479px) {
    font-size: 14px;
  }
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  height: 100vh;
  padding: 180px 60px;
  background-color: #eff7ff;
`;

const SkeletonButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 30px;
  width: 100%;
`;

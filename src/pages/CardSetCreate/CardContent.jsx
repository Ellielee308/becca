import styled from "styled-components";
import PropTypes from "prop-types";
import { TrashIcon, PlusIcon } from "./icon";
import { uploadImageToStorage, translateText } from "../../utils/api";
import { Input } from "antd";
const { TextArea } = Input;

export default function CardContent({
  currentTemplate,
  cardContent,
  setCardContent,
  isPurposeLanguageLearning,
  interfaceLanguage,
  suggestedTranslations,
  setSuggestedTranslations,
}) {
  const handleAddNewCard = () => {
    const newCardContent = [...cardContent];

    const newCard = {
      frontFields: currentTemplate.frontFields.map((field) => ({
        name: field.name,
        value: "",
      })),
      backFields: currentTemplate.backFields.map((field) => ({
        name: field.name,
        value: "",
      })),
    };

    newCardContent.push(newCard);
    setCardContent(newCardContent);
  };

  const handleDeleteCard = (index) => {
    const newCardContent = JSON.parse(JSON.stringify(cardContent));
    newCardContent.splice(index, 1);
    setCardContent(newCardContent);
  };

  const handleTextChange = (side, cardIndex, fieldIndex, value) => {
    const newCardContent = [...cardContent];
    newCardContent[cardIndex][side][fieldIndex].value = value;
    setCardContent(newCardContent);
  };

  const handleFileUpload = async (e, side, cardIndex, fieldIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 將圖片上傳到 Firebase Storage 並獲取圖片 URL
      const imageUrl = await uploadImageToStorage(file);

      // 更新 cardContent 狀態
      const newCardContent = [...cardContent];
      newCardContent[cardIndex][side][fieldIndex].value = imageUrl; // 將圖片 URL 存入對應欄位
      setCardContent(newCardContent);
    } catch (error) {
      console.error("圖片上傳失敗：", error);
    }
  };

  const handleBlur = async (cardIndex, fieldIndex) => {
    const textToTranslate =
      cardContent[cardIndex].frontFields[fieldIndex].value;

    if (
      textToTranslate.trim() &&
      isPurposeLanguageLearning &&
      interfaceLanguage
    ) {
      // 調用翻譯 API，根據 interfaceLanguage 翻譯成相應的語言
      const translatedText = await translateText(
        textToTranslate,
        interfaceLanguage
      );

      const newSuggestedTranslations = [...suggestedTranslations];
      newSuggestedTranslations[cardIndex] = translatedText;
      setSuggestedTranslations(newSuggestedTranslations); // 單獨存儲建議翻譯
    }
  };

  const handleSuggestionClick = (cardIndex, fieldIndex) => {
    const newCardContent = [...cardContent];
    newCardContent[cardIndex].backFields[fieldIndex].value =
      suggestedTranslations[cardIndex]; // 填入建議翻譯
    setCardContent(newCardContent); // 更新狀態
  };

  return (
    <Wrapper>
      {cardContent.map((card, cardIndex) => (
        <CardWrapper key={cardIndex}>
          <TitleBar>
            <Heading>{cardIndex + 1}</Heading>
            <ButtonGroupWrapper>
              {/* <ButtonIconContainer>
                <DragIcon />
              </ButtonIconContainer> */}
              <ButtonIconContainer onClick={() => handleDeleteCard(cardIndex)}>
                <TrashIcon />
              </ButtonIconContainer>
            </ButtonGroupWrapper>
          </TitleBar>
          <SideWrapper>
            <Side>
              <SideHeading>正面</SideHeading>
              {currentTemplate.templateName ? (
                (() => {
                  const firstTextInputIndex =
                    currentTemplate.frontFields.findIndex(
                      (field) => field.type === "text"
                    );

                  return currentTemplate.frontFields.map(
                    (frontField, index) => {
                      if (frontField.type === "text") {
                        return (
                          <CustomTextArea
                            autoSize
                            key={index}
                            placeholder={frontField.name}
                            value={card.frontFields[index]?.value || ""}
                            onChange={(e) =>
                              handleTextChange(
                                "frontFields",
                                cardIndex,
                                index,
                                e.target.value
                              )
                            }
                            onBlur={
                              index === firstTextInputIndex &&
                              firstTextInputIndex !== -1
                                ? () => handleBlur(cardIndex, index)
                                : null
                            }
                            $isRequired={frontField.required}
                          />
                        );
                      } else if (frontField.type === "image") {
                        return (
                          <ImageUploadWrapper key={index}>
                            <ImageFieldName $isRequired={frontField.required}>
                              {frontField.name}
                            </ImageFieldName>
                            <ImageInput
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(
                                  e,
                                  "frontFields",
                                  cardIndex,
                                  index
                                )
                              }
                            />
                            {card.frontFields[index]?.value && (
                              <ImagePreview
                                src={card.frontFields[index].value}
                              />
                            )}
                          </ImageUploadWrapper>
                        );
                      }
                      return null;
                    }
                  );
                })()
              ) : (
                <TextInput placeholder="單字" disabled />
              )}
            </Side>
            <SideSplit />
            <Side>
              <SideHeading>背面</SideHeading>
              {currentTemplate.templateName ? (
                (() => {
                  // 找到第一個 text 類型的 backField 的 index
                  const firstTextInputIndex =
                    currentTemplate.backFields.findIndex(
                      (field) => field.type === "text"
                    );

                  return currentTemplate.backFields.map((backField, index) => {
                    if (backField.type === "text") {
                      return (
                        <div key={index}>
                          <CustomTextArea
                            autoSize
                            placeholder={backField.name}
                            value={card.backFields[index]?.value || ""}
                            onChange={(e) =>
                              handleTextChange(
                                "backFields",
                                cardIndex,
                                index,
                                e.target.value
                              )
                            }
                            $isRequired={backField.required}
                          />
                          {index === firstTextInputIndex &&
                            firstTextInputIndex !== -1 &&
                            suggestedTranslations[cardIndex] && (
                              <SuggestionWrapper>
                                <SuggestionNotice>建議</SuggestionNotice>
                                <SuggestionWord
                                  onClick={() =>
                                    handleSuggestionClick(cardIndex, index)
                                  }
                                >
                                  {suggestedTranslations[cardIndex]}
                                </SuggestionWord>
                              </SuggestionWrapper>
                            )}
                        </div>
                      );
                    } else if (backField.type === "image") {
                      return (
                        <ImageUploadWrapper key={index}>
                          <ImageFieldName $isRequired={backField.required}>
                            {backField.name}
                          </ImageFieldName>
                          <ImageInput
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(
                                e,
                                "backFields",
                                cardIndex,
                                index
                              )
                            }
                          />
                          {card.backFields[index]?.value && (
                            <ImagePreview src={card.backFields[index].value} />
                          )}
                        </ImageUploadWrapper>
                      );
                    }
                    return null;
                  });
                })()
              ) : (
                <TextInput placeholder="字義" disabled />
              )}
            </Side>
          </SideWrapper>
        </CardWrapper>
      ))}
      <NewCardWrapper onClick={handleAddNewCard}>
        <NewCardHeading>
          <PlusButton>
            <PlusIcon />
          </PlusButton>
          <PlusLabel>新增新卡片</PlusLabel>
        </NewCardHeading>
      </NewCardWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
  width: 100%;
  max-width: 600px;
  gap: 20px;
`;

const CardWrapper = styled.div`
  margin: 20px 0px;
  padding: 35px 30px;
  border: 1px solid #c2c2c2;
  background-color: #fff;
  width: 100%;
  max-width: 600px;
  min-height: 180px;
  border-radius: 8px;
`;

const TitleBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Heading = styled.p`
  font-size: 18px;
`;
const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const SideWrapper = styled.div`
  margin-top: 20px;
  /* padding: 35px 30px; */
  display: flex;
  flex-direction: row;
  @media only screen and (max-width: 559px) {
    flex-direction: column;
  }
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const SideSplit = styled.div`
  height: 80px;
  border-left: 1px solid #c2c2c2;
  margin: 0 16px;
  @media only screen and (max-width: 559px) {
    height: 0px;
    width: 20%;
    border-left: none;
    margin: 20px 0px;
  }
`;

const SideHeading = styled.p`
  font-size: 14px;
  margin-bottom: 8px;
`;

const TextInput = styled.input`
  height: 30px;
  border: solid 1px #c1c0c0;
  border-radius: 4px;
  width: 100%;
`;

const CustomTextArea = styled(TextArea)`
  &::placeholder {
    color: ${(props) =>
      props.$isRequired ? "#ff6f61" : "rgba(0, 0, 0, 0.35)"};
  }
`;

const NewCardWrapper = styled.div`
  border: 1px solid #c2c2c2;
  width: 100%;
  max-width: 600px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
`;

const NewCardHeading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const PlusButton = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  margin-right: 15px;
  align-items: center;
  justify-content: center;
  background-color: #adadad;
  border-radius: 4px;
`;

const PlusLabel = styled.p`
  font-size: 20px;
`;

const ImageUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ImageFieldName = styled.p`
  font-size: 14px;
  color: #636262;
  color: ${(props) => (props.$isRequired ? "#ff6f61" : " #636262;")};
`;

const ImageInput = styled.input`
  margin-top: 8px;
`;

const ButtonIconContainer = styled.div`
  cursor: pointer;
`;

const ImagePreview = styled.img`
  margin-top: 4px;
  height: 100px;
  width: 100%;
  object-fit: contain;
`;

const SuggestionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 0px 10px 0px;
  /* border: 1px solid black; */
`;

const SuggestionNotice = styled.p`
  font-size: 12px;
  color: #4350fa;
  user-select: none;
  margin-bottom: 8px;
`;

const SuggestionWord = styled.div`
  cursor: pointer;
  background-color: #e0f2ff;
  overflow-y: hidden;
  height: 24px;
  line-height: 24px;
  padding: 0 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
  color: #1a73e8;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background-color: #cce6ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(26, 115, 232, 0.2);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(26, 115, 232, 0.1);
  }
`;

CardContent.propTypes = {
  currentTemplate: PropTypes.shape({
    templateName: PropTypes.string.isRequired,
    frontFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(["text", "image"]).isRequired,
        required: PropTypes.bool.isRequired,
        position: PropTypes.shape({
          x: PropTypes.string.isRequired,
          y: PropTypes.string.isRequired,
        }).isRequired,
        style: PropTypes.shape({
          width: PropTypes.string.isRequired,
          height: PropTypes.string.isRequired,
          fontSize: PropTypes.string,
          fontWeight: PropTypes.string,
          color: PropTypes.string,
          textAlign: PropTypes.string,
        }).isRequired,
      })
    ).isRequired,
    backFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(["text", "image"]).isRequired,
        required: PropTypes.bool.isRequired,
        position: PropTypes.shape({
          x: PropTypes.string.isRequired,
          y: PropTypes.string.isRequired,
        }).isRequired,
        style: PropTypes.shape({
          width: PropTypes.string.isRequired,
          height: PropTypes.string.isRequired,
          fontSize: PropTypes.string,
          fontWeight: PropTypes.string,
          color: PropTypes.string,
          textAlign: PropTypes.string,
        }).isRequired,
      })
    ).isRequired,
  }).isRequired,
  cardContent: PropTypes.array,
  setCardContent: PropTypes.func,
  isPurposeLanguageLearning: PropTypes.bool,
  interfaceLanguage: PropTypes.string,
  suggestedTranslations: PropTypes.array,
  setSuggestedTranslations: PropTypes.func,
};

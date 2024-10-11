import styled, { css } from "styled-components";
import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Rnd } from "react-rnd";
import imageIcon from "./images/photo.png";
import { message } from "antd";
import { Input } from "antd";
const { TextArea } = Input;
import {
  TrashIcon,
  BoldIcon,
  ItalicIcon,
  TextAlignRightIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
} from "./icon";
import { saveCardTemplate } from "../../utils/api";
import { useUser } from "../../context/UserContext.jsx";

const fontSizeOptions = [
  {
    value: "xs",
    label: "XS",
  },
  {
    value: "s",
    label: "S",
  },
  {
    value: "m",
    label: "M",
  },
  {
    value: "l",
    label: "L",
  },
  {
    value: "xl",
    label: "XL",
  },
  {
    value: "2xl",
    label: "2XL",
  },
];
const NewTemplateModal = ({
  currentStyle,
  onClose,
  onTemplateAdded,
  templateNames,
}) => {
  const [invalidTemplateName, setInvalidTemplateName] = useState(false);
  const [existedTemplateName, setExistedTemplateName] = useState(false);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const { user } = useUser();
  const cardRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [newTemplateData, setNewTemplateData] = useState({
    fieldTemplateId: "", //自動生成
    templateName: "",
    frontFields: [
      {
        name: "Front Text",
        type: "text",
        required: true,
        position: { x: 200, y: 150 },
        style: {
          width: "200px",
          height: "100px",
          fontSize: "m",
          fontWeight: "normal",
          fontStyle: "normal",
          color: "#333333",
          textAlign: "center",
        },
      },
    ],
    backFields: [
      {
        name: "Back Text",
        type: "text",
        required: true,
        position: { x: 200, y: 150 },
        style: {
          width: "200px",
          height: "100px",
          fontSize: "m",
          fontWeight: "normal",
          fontStyle: "normal",
          color: "#333333",
          textAlign: "center",
        },
      },
    ],
    createdAt: "",
  });

  const handleFlip = () => {
    setIsFlipped((prevState) => !prevState);
    setSelectedField(null);
  };

  // 通用更新
  const handleFieldUpdate = (side, index, updatedField) => {
    const updatedFields = [...newTemplateData[side]];
    updatedFields[index] = { ...updatedFields[index], ...updatedField };

    setNewTemplateData((prevData) => ({
      ...prevData,
      [side]: updatedFields,
    }));
  };

  // 處理拖曳結束事件
  const handleFieldDrag = (side, index, position) => {
    handleFieldUpdate(side, index, { position });
  };

  // 處理調整大小結束事件
  const handleFieldResize = (side, index, newStyle) => {
    const updatedFields = [...newTemplateData[side]];

    // 保留原有的 style 屬性，僅更新新的寬度和高度
    const currentStyle = updatedFields[index].style;
    updatedFields[index].style = { ...currentStyle, ...newStyle };

    setNewTemplateData((prevData) => ({
      ...prevData,
      [side]: updatedFields,
    }));
  };

  const handleAddField = (newField, fieldSide) => {
    const updatedFields = [...newTemplateData[fieldSide], newField];

    setNewTemplateData((prevData) => ({
      ...prevData,
      [fieldSide]: updatedFields,
    }));
  };

  // 處理欄位刪除
  const handleDeleteField = (side, index) => {
    // 檢查是否刪除的是目前選中的欄位
    if (side === selectedField?.side && index === selectedField?.index) {
      setSelectedField(null);
    }
    const updatedFields = newTemplateData[side].filter((_, i) => i !== index);

    setNewTemplateData((prevData) => ({
      ...prevData,
      [side]: updatedFields,
    }));
  };

  const handleFieldClick = (side, index, fieldType) => {
    setSelectedField({ side, index, fieldType }); // 設定選中的欄位
  };

  const handleSubmit = async () => {
    setInvalidTemplateName(false);
    setExistedTemplateName(false);
    if (isSaving) return;

    if (newTemplateData.templateName.trim() === "") {
      message.error("請填入模板名稱");
      setInvalidTemplateName(true);
      return;
    }
    if (templateNames.includes(newTemplateData.templateName)) {
      setExistedTemplateName(true);
      message.error("模板名稱已存在，請使用其他名稱！");
      return;
    }
    if (
      newTemplateData.frontFields.length < 1 ||
      newTemplateData.backFields.length < 1
    ) {
      message.error("正反面至少都需要有一個欄位！");
      return;
    }

    // 取得 CardWrapper 的大小
    const cardRect = cardRef.current.getBoundingClientRect();

    // 計算百分比位置和大小
    const updatedFrontFields = newTemplateData.frontFields.map((field) => ({
      ...field,
      position: {
        x: (field.position.x / cardRect.width) * 100 + "%",
        y: (field.position.y / cardRect.height) * 100 + "%",
      },
      style: {
        ...field.style,
        width: (parseInt(field.style.width, 10) / cardRect.width) * 100 + "%",
        height:
          (parseInt(field.style.height, 10) / cardRect.height) * 100 + "%",
      },
    }));

    const updatedBackFields = newTemplateData.backFields.map((field) => ({
      ...field,
      position: {
        x: (field.position.x / cardRect.width) * 100 + "%",
        y: (field.position.y / cardRect.height) * 100 + "%",
      },
      style: {
        ...field.style,
        width: (parseInt(field.style.width, 10) / cardRect.width) * 100 + "%",
        height:
          (parseInt(field.style.height, 10) / cardRect.height) * 100 + "%",
      },
    }));

    const updatedTemplateData = {
      ...newTemplateData,
      frontFields: updatedFrontFields,
      backFields: updatedBackFields,
    };
    setIsSaving(true);
    try {
      messageApi.open({
        type: "loading",
        content: "儲存中，請稍候...",
        duration: 0,
      });
      const newTemplateId = await saveCardTemplate({
        ...updatedTemplateData,
        userId: user.userId,
      });

      messageApi.destroy();

      messageApi.open({
        type: "success",
        content: "儲存成功！",
        duration: 2,
      });

      setTimeout(() => {
        onTemplateAdded(updatedTemplateData, newTemplateId);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("儲存樣式失敗：", error.message);

      messageApi.destroy();

      messageApi.open({
        type: "error",
        content: "儲存失敗，請再試一次。",
        duration: 3,
      });
    } finally {
      setTimeout(() => {
        setIsSaving(false); // 確保表單關閉後才允許再次提交
      }, 2000);
    }
  };

  return (
    <>
      {contextHolder}
      <ModalWrapper>
        <ModalContent>
          <Heading>
            <EditIcon />
            <p>新增模板</p>
          </Heading>
          <CloseIcon onClick={onClose}>×</CloseIcon>
          <EditAreaWrapper>
            <LabelName>模板名稱</LabelName>
            <TemplateNameInput
              onChange={(e) =>
                setNewTemplateData({
                  ...newTemplateData,
                  templateName: e.target.value,
                })
              }
            />
            {invalidTemplateName && (
              <InvalidFieldNotice>請填入模板名稱</InvalidFieldNotice>
            )}
            {existedTemplateName && (
              <InvalidFieldNotice>
                模板名稱已存在，請使用其他名稱！
              </InvalidFieldNotice>
            )}
            <SideFieldList>
              <SideField>
                <FieldHeading>正面</FieldHeading>
                <FieldList>
                  <FieldHeader>No.</FieldHeader>
                  <FieldHeader>欄位名稱</FieldHeader>
                  <FieldHeader>類型</FieldHeader>
                  <FieldHeader>是否為必填</FieldHeader>
                  <FieldHeader>刪除</FieldHeader>
                  {newTemplateData.frontFields.map((frontField, index) => (
                    <React.Fragment key={index}>
                      <FieldIndex>{index + 1}.</FieldIndex>
                      <TextArea
                        autoSize
                        value={frontField.name}
                        onChange={(e) =>
                          handleFieldUpdate("frontFields", index, {
                            name: e.target.value,
                          })
                        }
                      />
                      <FieldType>
                        {frontField.type === "text" ? "文字" : "圖片"}
                      </FieldType>
                      <FieldRequired>
                        {frontField.required ? "是" : "否"}
                      </FieldRequired>
                      <TrashIconContainer
                        onClick={() => handleDeleteField("frontFields", index)}
                      >
                        <TrashIcon />
                      </TrashIconContainer>
                    </React.Fragment>
                  ))}
                </FieldList>
              </SideField>
              <SideField>
                <FieldHeading>背面</FieldHeading>
                <FieldList>
                  <FieldHeader>No.</FieldHeader>
                  <FieldHeader>欄位名稱</FieldHeader>
                  <FieldHeader>類型</FieldHeader>
                  <FieldHeader>是否為必填</FieldHeader>
                  <FieldHeader>刪除</FieldHeader>
                  {newTemplateData.backFields.map((backField, index) => (
                    <React.Fragment key={index}>
                      <FieldIndex>{index + 1}.</FieldIndex>
                      <TextArea
                        autoSize
                        value={backField.name}
                        onChange={(e) =>
                          handleFieldUpdate("backFields", index, {
                            name: e.target.value,
                          })
                        }
                      />
                      <FieldType>
                        {backField.type === "text" ? "文字" : "圖片"}
                      </FieldType>
                      <FieldRequired>
                        {backField.required ? "是" : "否"}
                      </FieldRequired>
                      <TrashIconContainer
                        onClick={() => handleDeleteField("backFields", index)}
                      >
                        <TrashIcon />
                      </TrashIconContainer>
                    </React.Fragment>
                  ))}
                </FieldList>
              </SideField>
            </SideFieldList>
            <AddFieldButton onClick={() => setIsAddFieldModalOpen(true)}>
              新增欄位
            </AddFieldButton>
            <Label>預覽</Label>
            <FlipButton onClick={handleFlip}>翻轉</FlipButton>
            {selectedField && selectedField.fieldType !== "image" ? (
              <TextStyleEditor
                field={newTemplateData[selectedField.side][selectedField.index]}
                onUpdate={(updatedField) =>
                  handleFieldUpdate(
                    selectedField.side,
                    selectedField.index,
                    updatedField
                  )
                }
              />
            ) : (
              <TextStyleEditorPlaceholder>
                可拖曳移動位置或點選文字進一步編輯
              </TextStyleEditorPlaceholder>
            )}
            <CardWrapper ref={cardRef}>
              <FlipCard isFlipped={isFlipped} currentStyle={currentStyle}>
                <FrontCard isFlipped={isFlipped} currentStyle={currentStyle}>
                  {newTemplateData.frontFields.map((field, index) => (
                    <Rnd
                      key={index}
                      size={{
                        width: field.style.width,
                        height: field.style.height,
                      }}
                      position={{ x: field.position.x, y: field.position.y }}
                      onClick={() =>
                        handleFieldClick("frontFields", index, field.type)
                      } // 追蹤點擊事件
                      onDragStop={(e, d) => {
                        handleFieldDrag("frontFields", index, {
                          x: d.x,
                          y: d.y,
                        });
                        handleFieldClick("frontFields", index, field.type); // 拖曳後選取
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        handleFieldResize("frontFields", index, {
                          width: ref.style.width,
                          height: ref.style.height,
                        });
                        handleFieldClick("frontFields", index, field.type); // 調整大小後選取
                      }}
                      bounds="parent"
                    >
                      <FieldContainer
                        style={field.style}
                        isSelected={
                          selectedField &&
                          selectedField.side === "frontFields" &&
                          selectedField.index === index
                        }
                      >
                        {renderFieldContent(field)}
                      </FieldContainer>
                    </Rnd>
                  ))}
                </FrontCard>
                <BackCard isFlipped={isFlipped} currentStyle={currentStyle}>
                  {newTemplateData.backFields.map((field, index) => (
                    <Rnd
                      key={index}
                      size={{
                        width: field.style.width,
                        height: field.style.height,
                      }}
                      position={{ x: field.position.x, y: field.position.y }}
                      onClick={() =>
                        handleFieldClick("backFields", index, field.type)
                      } // 追蹤點擊事件
                      onDragStop={(e, d) => {
                        handleFieldDrag("backFields", index, {
                          x: d.x,
                          y: d.y,
                        });
                        handleFieldClick("backFields", index, field.type); // 拖曳後選取
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        handleFieldResize("backFields", index, {
                          width: ref.style.width,
                          height: ref.style.height,
                        });
                        handleFieldClick("backFields", index, field.type); // 調整大小後選取
                      }}
                      bounds="parent"
                    >
                      <FieldContainer
                        style={field.style}
                        isSelected={
                          selectedField &&
                          selectedField.side === "backFields" &&
                          selectedField.index === index
                        }
                      >
                        {renderFieldContent(field)}
                      </FieldContainer>
                    </Rnd>
                  ))}
                </BackCard>
              </FlipCard>
            </CardWrapper>
          </EditAreaWrapper>
          <SaveButton onClick={handleSubmit} $notAllowed={isSaving}>
            {isSaving ? "儲存中..." : "儲存模板"}
          </SaveButton>
          {isAddFieldModalOpen && (
            <AddFieldModal
              onClose={() => setIsAddFieldModalOpen(false)}
              onSave={handleAddField}
            />
          )}
        </ModalContent>
      </ModalWrapper>
    </>
  );
};

export default NewTemplateModal;

NewTemplateModal.propTypes = {
  currentStyle: PropTypes.object,
  onClose: PropTypes.func,
  onTemplateAdded: PropTypes.func,
  templateNames: PropTypes.array,
};

const renderFieldContent = (field) => {
  switch (field.type) {
    case "text":
      return field.name; // 渲染文字內容
    case "image":
      return (
        <ImageWrapper>
          <ImageExample
            src={imageIcon}
            alt={field.name}
            style={field.style}
            draggable={false}
          />
          <ImageName>{field.name}</ImageName>
        </ImageWrapper>
      );
    default:
      return null; // 如果類型未定義，不渲染任何內容
  }
};

const getResponsiveFontSize = (fontSizeValue) => {
  let sizes;

  switch (fontSizeValue) {
    case "xs":
      sizes = { small: "8px", medium: "10px", large: "12px" };
      break;
    case "s":
      sizes = { small: "12px", medium: "14px", large: "18px" };
      break;
    case "m":
      sizes = { small: "16px", medium: "18px", large: "24px" };
      break;
    case "l":
      sizes = { small: "20px", medium: "22px", large: "30px" };
      break;
    case "xl":
      sizes = { small: "24px", medium: "26px", large: "36px" };
      break;
    case "2xl":
      sizes = { small: "29px", medium: "30px", large: "42px" };
      break;
    default:
      sizes = { small: "16px", medium: "20px", large: "24px" }; // 默認大小
  }

  return css`
    font-size: ${sizes.small};

    @media (min-width: 600px) {
      font-size: ${sizes.medium};
    }

    @media (min-width: 1024px) {
      font-size: ${sizes.large};
    }
  `;
};

const LabelName = styled.label`
  font-size: 16px;
`;

const Label = styled.label`
  font-size: 16px;
`;

const InvalidFieldNotice = styled.p`
  font-size: 12px;
  color: red;
  margin-top: 5px;
`;

const TemplateNameInput = styled.input`
  margin-top: 8px;
  height: 28px;
  padding: 0px 5px;
  border: solid 1px #c1c0c0;
  border-radius: 4px;
  font-size: 18px;
  &:focus {
    outline: 2px solid #2684ff;
  }
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: white;
  padding: 40px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  height: 90%;
  position: relative;
  overflow-y: auto;
`;

const Heading = styled.h3`
  font-size: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #3d5a80;
`;

const CloseIcon = styled.p`
  position: absolute;
  color: black;
  right: 40px;
  top: 40px;
  font-size: 28px;
  font-weight: 600;
  cursor: pointer;
`;

const EditAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardWrapper = styled.div`
  align-self: center;
  display: block;
  margin: 36px auto;
  width: 600px;
  height: 400px;
  perspective: 1000px;
  transform-style: preserve-3d;
  @media only screen and (max-width: 939px) {
    width: 100%;
    max-width: 600px;
    aspect-ratio: 3 / 2;
    height: auto;
  }
`;

const FlipCard = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: ${(props) => {
    switch (props.currentStyle.animation) {
      case "fade":
        return "opacity 0.5s ease-in-out";
      default:
        return "all 0.5s ease-in-out";
    }
  }};
  transform: ${(props) => {
    switch (props.currentStyle.animation) {
      case "horizontalFlip":
        return props.isFlipped ? "rotateY(180deg)" : "rotateY(0)";
      case "fade":
        return "none";
      default: // "vertical"
        return props.isFlipped ? "rotateX(180deg)" : "rotateX(0)";
    }
  }};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
`;

const FrontCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  outline-style: ${(props) => props.currentStyle.borderStyle};
  outline-color: ${(props) => props.currentStyle.borderColor};
  outline-width: ${(props) => props.currentStyle.borderWidth};
  background-color: ${(props) => props.currentStyle.backgroundColor};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  backface-visibility: hidden;
  font-family: ${(props) => props.currentStyle.fontFamily};
  font-size: 32px;
  opacity: ${(props) =>
    props.currentStyle.animation === "fade" && props.isFlipped ? 0 : 1};
  transition: ${(props) =>
    props.currentStyle.animation === "fade"
      ? "opacity 0.5s ease-in-out"
      : "none"};
`;

const BackCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  outline-style: ${(props) => props.currentStyle.borderStyle};
  outline-color: ${(props) => props.currentStyle.borderColor};
  outline-width: ${(props) => props.currentStyle.borderWidth};
  background-color: ${(props) => props.currentStyle.backgroundColor};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  backface-visibility: hidden;
  font-family: ${(props) => props.currentStyle.fontFamily};
  transform: ${(props) => {
    switch (props.currentStyle.animation) {
      case "horizontalFlip":
        return "rotateY(180deg)";
      case "fade":
        return "none";
      default: // "vertical"
        return "rotateX(180deg)";
    }
  }};
  font-size: 32px;
  opacity: ${(props) =>
    props.currentStyle.animation === "fade" ? (props.isFlipped ? 1 : 0) : 1};
  transition: ${(props) =>
    props.currentStyle.animation === "fade"
      ? "opacity 0.5s ease-in-out"
      : "none"};
  z-index: ${(props) => (props.isFlipped ? 3000 : 0)};
`;

const FieldContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: ${(props) => props.style.textAlign || "center"};
  align-items: center;
  border: ${(props) => (props.isSelected ? "2px dotted black" : "none")};
  cursor: move;
  ${(props) =>
    props.style &&
    css`
      width: ${props.style.width};
      height: ${props.style.height};
      font-weight: ${props.style.fontWeight};
      color: ${props.style.color};
      font-style: ${props.style.fontStyle};
      ${getResponsiveFontSize(props.style.fontSize)};
    `}
`;

// 用於顯示圖片的樣式
const ImageExample = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: ${(props) => props.style?.objectFit || "cover"};
`;

const SideFieldList = styled.div`
  display: flex;
  flex-direction: row;
  margin: 12px 0 20px 0;
  height: fit-content;
  gap: 16px;
  @media only screen and (max-width: 939px) {
    flex-direction: column;
  }
`;
const SideField = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #f8f8f8; // 柔和的背景色
  padding: 16px;
  border-radius: 8px; // 圓角
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // 增加陰影
`;

const FieldHeading = styled.h4`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
`;
const FieldList = styled.div`
  display: grid;
  grid-template-columns: 1fr 4fr 2fr 3fr 1fr;
  grid-row-gap: 10px;
  align-items: center;
`;

const FieldHeader = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #3d5a80;
  text-align: center;
`;

const FieldIndex = styled.p`
  font-size: 14px;
  color: #333;
  text-align: center;
`;

const FieldType = styled.p`
  font-size: 14px;
  color: #555;
  text-align: center;
`;

const FieldRequired = styled.p`
  font-size: 14px;
  color: ${(props) => (props.required ? "#ff4d4f" : "#555")};
  text-align: center;
`;

const TrashIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #ff4d4f; // 鮮豔紅色來顯示刪除圖標
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.1);
    color: #d32f2f; // hover 時讓顏色更深
  }
`;

const FlipButton = styled.div`
  background-color: rgb(221, 216, 216);
  margin-top: 15px;
  width: 80px;
  height: 25px;
  border-radius: 4px;
  line-height: 25px;
  text-align: center;
  cursor: pointer;
  align-self: flex-end;
`;

const SaveButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px auto 0 auto;
  align-self: center;
  width: 128px;
  height: 45px;
  font-size: 16px;
  line-height: 16px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  cursor: ${(props) => (props.$notAllowed ? "not-allowed" : "pointer")};
`;

const AddFieldButton = styled.div`
  background-color: #cce5ff; /* 淺藍色，符合主題 */
  color: #003366; /* 深藍色文字，提升可讀性 */
  width: 120px;
  height: 30px;
  line-height: 30px;
  border-radius: 4px;
  text-align: center;
  margin: 0 auto;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0px 4px 8px rgba(0, 0, 102, 0.2); /* 添加陰影效果以增強互動性 */
  }
`;

// 用於顯示圖片的樣式
const ImageWrapper = styled.div`
  position: relative;
  display: inline-block; // 讓 ImageWrapper 的大小與圖片保持一致
`;

const ImageName = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  width: fit-content;
  pointer-events: none;
`;

const TextStyleEditorPlaceholder = styled.div`
  height: 46px;
  color: gray;
  text-align: center;
  line-height: 46px;
`;

const TextStyleEditor = ({ field, onUpdate }) => {
  const handleStyleChange = (newStyle) => {
    onUpdate({ style: { ...field.style, ...newStyle } });
  };
  return (
    <TextStyleWrapper>
      <Select
        options={fontSizeOptions}
        styles={fontSizeDropDownStyle}
        value={fontSizeOptions.find(
          (option) => option.value === field.style.fontSize
        )}
        onChange={(option) => handleStyleChange({ fontSize: option.value })}
      ></Select>
      <TextStyleIconContainer
        isSelected={field.style.fontWeight === "bold"}
        onClick={() =>
          handleStyleChange({
            fontWeight: field.style.fontWeight === "bold" ? "normal" : "bold",
          })
        }
      >
        <BoldIcon />
      </TextStyleIconContainer>
      <TextStyleIconContainer
        isSelected={field.style.fontStyle === "italic"}
        onClick={() =>
          handleStyleChange({
            fontStyle: field.style.fontStyle === "italic" ? "normal" : "italic",
          })
        }
      >
        <ItalicIcon />
      </TextStyleIconContainer>
      <ColorInput
        type="color"
        value={field.style.color}
        onChange={(e) => handleStyleChange({ color: e.target.value })}
      />
      <TextStyleIconContainer
        isSelected={field.style.textAlign === "left"}
        onClick={() => handleStyleChange({ textAlign: "left" })}
      >
        <TextAlignLeftIcon />
      </TextStyleIconContainer>
      <TextStyleIconContainer
        isSelected={field.style.textAlign === "center"}
        onClick={() => handleStyleChange({ textAlign: "center" })}
      >
        <TextAlignCenterIcon />
      </TextStyleIconContainer>
      <TextStyleIconContainer
        isSelected={field.style.textAlign === "right"}
        onClick={() => handleStyleChange({ textAlign: "right" })}
      >
        <TextAlignRightIcon />
      </TextStyleIconContainer>
    </TextStyleWrapper>
  );
};

TextStyleEditor.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["text", "image"]).isRequired,
    required: PropTypes.bool.isRequired,
    position: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    style: PropTypes.shape({
      width: PropTypes.string.isRequired,
      height: PropTypes.string.isRequired,
      fontSize: PropTypes.string.isRequired,
      fontWeight: PropTypes.oneOf(["normal", "bold"]).isRequired,
      fontStyle: PropTypes.oneOf(["normal", "italic"]).isRequired,
      color: PropTypes.string.isRequired,
      textAlign: PropTypes.oneOf(["left", "center", "right"]).isRequired,
    }).isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

const TextStyleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 auto;
  border-radius: 4px;
  padding: 4px;
  background-color: rgba(0, 0, 0, 0.3); // 半透明的黑色背景
  width: fit-content;
  gap: 2px;
  @media only screen and (max-width: 939px) {
    margin-top: 8px;
  }
`;

const TextStyleIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border: ${(props) => (props.isSelected ? "1px solid #2c2b2b" : "none")};
  background-color: ${(props) =>
    props.isSelected ? "#c7c6c6" : "transparent"};
  border-radius: ${(props) => (props.isSelected ? "5px" : "none")};
  cursor: pointer;
  position: relative;
`;

const ColorInput = styled.input`
  width: 28px;
  height: 28px;
`;

const fontSizeDropDownStyle = {
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: 4, // 調整箭頭的間距
    svg: {
      width: 12, // 修改箭頭圖標的寬度
      height: 12, // 修改箭頭圖標的高度
    },
  }),
};

// AddNewFieldModal
const AddFieldModal = ({ onClose, onSave }) => {
  const [fieldName, setFieldName] = useState("新欄位");
  const [fieldType, setFieldType] = useState("text"); // 預設為文字
  const [fieldSide, setFieldSide] = useState("frontFields"); // 預設為正面
  const [isRequired, setIsRequired] = useState(false);
  const [invalidFieldName, setInvalidFieldName] = useState(false);

  const handleSave = () => {
    if (fieldName.trim() === "") {
      setInvalidFieldName(true);
      return;
    }

    const newField = {
      name: fieldName,
      type: fieldType,
      required: isRequired,
      position: fieldType === "text" ? { x: 200, y: 150 } : { x: 200, y: 100 }, // 新欄位的默認位置
      style:
        fieldType === "text"
          ? {
              width: "200px",
              height: "100px",
              fontSize: "m",
              fontWeight: "normal",
              fontStyle: "normal",
              color: "#333333",
              textAlign: "center",
            }
          : {
              width: "200px",
              height: "200px",
              objectFit: "contain",
            },
    };

    onSave(newField, fieldSide);
    onClose();
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <AddFieldModalContent>
        <AddFieldHeading>新增欄位</AddFieldHeading>
        <CloseIcon onClick={onClose}>×</CloseIcon>
        <Label>欄位名稱</Label>
        <TextArea
          autoSize
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          style={{
            fontSize: "14px",
            borderColor: invalidFieldName ? "#ff6f61" : "#d9d9d9",
            paddingTop: "5px",
            paddingLeft: "4px",
          }}
        />
        <Label>新增在哪一面？</Label>
        <NewFieldSelect
          value={fieldSide}
          onChange={(e) => setFieldSide(e.target.value)}
        >
          <option value="frontFields">正面</option>
          <option value="backFields">背面</option>
        </NewFieldSelect>
        <Label>欄位類型</Label>
        <NewFieldSelect
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
        >
          <option value="text">文字</option>
          <option value="image">圖片</option>
        </NewFieldSelect>
        <IsRequiredWrapper>
          <Label>是否為必填</Label>
          <input
            type="checkbox"
            checked={isRequired}
            onChange={() => setIsRequired(!isRequired)}
          />
        </IsRequiredWrapper>
        <SaveButton onClick={handleSave}>儲存欄位</SaveButton>
      </AddFieldModalContent>
    </>
  );
};

AddFieldModal.propTypes = {
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};

// Overlay 遮罩層
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.1); // 半透明黑色遮罩
  z-index: 2000;
`;

const AddFieldModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 3000;
  position: absolute;
  top: 20%;
  left: 20%;
  padding: 40px;
  width: 60%;
  height: fit-content;
  border-radius: 8px;
  background: aliceblue;
  overflow-y: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  @media only screen and (max-width: 939px) {
    width: 90%; // 讓它在小螢幕中更加自適應
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); // 將元件置於螢幕正中央
  }
`;

const AddFieldHeading = styled.h3`
  font-size: 20px;
  font-weight: 500;
`;

const NewFieldSelect = styled.select`
  height: 30px;
  border-radius: 8px;
  border-color: #d9d9d9;
  font-size: 14px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
`;

const IsRequiredWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  height: 28px;
`;

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="24"
    height="24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
    />
  </svg>
);

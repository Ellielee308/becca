import styled from "styled-components";
import PropTypes from "prop-types";
import Select from "react-select";
import { useEffect, useState } from "react";
import { TwitterPicker } from "react-color";
import { useUser } from "../context/UserContext.jsx";
import { message } from "antd";
import borderRadiusIcon from "./images/borderRadius.png";
import borderThicknessIcon from "./images/lineThickness.png";
import borderColorIcon from "./images/borderColorIcon.png";
import backgroundColorIcon from "./images/backgroundColor.png";
import Card from "./Card.jsx";
import { saveCardStyle } from "../utils/api.js";

const borderStyleOptions = [
  { value: "none", label: "無" },
  { value: "solid", label: "實線" },
  { value: "dashed", label: "虛線" },
  { value: "dotted", label: "圓點" },
  { value: "double", label: "雙實線" },
];

const borderWidthOptions = [
  { value: "2px", label: "2px" },
  { value: "4px", label: "4px" },
  { value: "8px", label: "8px" },
  { value: "12px", label: "12px" },
  { value: "16px", label: "16px" },
];

const fontOptions = [
  { value: "Arial", label: "Arial" },
  { value: "Oswald", label: "Oswald" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Raleway", label: "Raleway" },
  { value: "Poppins", label: "Poppins" },
  { value: "Noto Sans TC", label: "思源黑體" },
];

const animationOptions = [
  { value: "verticalFlip", label: "上下翻轉" },
  { value: "horizontalFlip", label: "左右翻轉" },
  // { value: "fade", label: "淡入淡出" },
];

const defaultBackgroundColors = [
  "#FFFFFF",
  "#f0f8ff",
  "#FAF0E6",
  "#FAF0E6", // Linen
  "#FFF5EE", // Seashell
  "#FFF8DC", // Cornsilk
  "#F5FFFA", // MintCream
  "#F0FFF0", // Honeydew
  "#FFFAF0", // FloralWhite
  "#F0FFFF", // Azure
  "#E6E6FA", // Lavender
  "#FFFACD", // LemonChiffon
  "#FFEFD5", // PapayaWhip
  "#E0FFFF", // LightCyan
  "#FFEBEE", // LightPink
  "#FFFDE7", // LightYellow
  "#E8F5E9", // LightGreen
];

const NewStyleModal = ({ onClose, onStyleAdded, styleNames }) => {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [style, setStyle] = useState({
    styleId: "",
    styleName: "",
    borderStyle: "none",
    borderColor: "",
    borderWidth: "",
    borderRadius: "",
    backgroundColor: "#FFFFFF",
    fontFamily: "Arial",
    animation: "verticalFlip",
    createdAt: "",
  });

  const [invalidStyleName, setInvalidStyleName] = useState(false);
  const [existedStyleName, setExistedStyleName] = useState(false);

  const [colorPickerVisible, setColorPickerVisible] = useState({
    borderColor: false,
    backgroundColor: false,
  });

  const [borderWidthPickerVisible, setBorderWidthPickerVisible] =
    useState(false);

  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleBorderStyleChange = (selectedOption) => {
    const newBorderStyle = selectedOption.value;
    setStyle({
      ...style,
      borderStyle: newBorderStyle,
      borderWidth:
        newBorderStyle !== "none"
          ? style.borderWidth === ""
            ? "2px"
            : style.borderWidth
          : "",
    });
  };

  // 顏色選擇處理函數
  const handleColorChange = (color, target) => {
    setStyle({ ...style, [target]: color.hex });
    setColorPickerVisible({ ...colorPickerVisible, [target]: false });
  };

  const handleRadiusChange = () => {
    setStyle({
      ...style,
      borderRadius: style.borderRadius === "25px" ? "" : "25px",
    });
  };

  const handleOpenBorderWidthMenu = (e) => {
    if (style.borderStyle === "none") return;
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setPickerPosition({ top: rect.bottom + 5, left: rect.left - 30 });
    setBorderWidthPickerVisible((prevState) => !prevState);
  };

  const handleColorIconClick = (event, target) => {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    setPickerPosition({ top: rect.bottom + 15, left: rect.left - 10 });
    setColorPickerVisible((prev) => ({
      ...prev,
      [target]: !prev[target],
    }));
  };

  const handleBorderWidthChange = (selectedOption) => {
    if (style.borderStyle === "none") return;
    setStyle({ ...style, borderWidth: selectedOption.value });
  };

  const handleFontChange = (selectedOption) => {
    setStyle({ ...style, fontFamily: selectedOption.value });
  };
  const handleAnimationChange = (selectedOption) => {
    setStyle({ ...style, animation: selectedOption.value });
  };

  const closeAllPickers = () => {
    setBorderWidthPickerVisible(false);
    setColorPickerVisible({
      borderColor: false,
      backgroundColor: false,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setInvalidStyleName(false);
    setExistedStyleName(false);
    if (isSaving) return;

    if (style.styleName === "" || !style.styleName.trim()) {
      message.error("請填入樣式名稱");
      setInvalidStyleName(true);
      return;
    } else if (styleNames.includes(style.styleName)) {
      setExistedStyleName(true);
      message.error("樣式名稱已存在，請使用其他名稱！");
      setInvalidStyleName(false);
      return;
    } else {
      setInvalidStyleName(false);
      setIsSaving(true);
      try {
        messageApi.open({
          type: "loading",
          content: "儲存中，請稍候...",
          duration: 0,
        });

        const newStyleId = await saveCardStyle({
          ...style,
          userId: user.userId,
        });

        messageApi.destroy();

        messageApi.open({
          type: "success",
          content: "儲存成功！",
          duration: 2,
        });

        setTimeout(() => {
          onStyleAdded(style, newStyleId);
          onClose();
        }, 2000);
      } catch (error) {
        console.error("儲存樣式失敗：", error);

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
    }
  };

  return (
    <>
      {contextHolder}
      <ModalWrapper onClick={closeAllPickers}>
        <ModalContent onClick={closeAllPickers}>
          <Heading>
            <EditIcon />
            <p>新增樣式</p>
          </Heading>
          <CloseIcon onClick={onClose}>×</CloseIcon>
          <Form onSubmit={handleSubmit}>
            <Label htmlFor="styleName">樣式名稱</Label>
            <StyleNameInput
              id="styleName"
              onChange={(e) =>
                setStyle({ ...style, styleName: e.target.value })
              }
            />
            {invalidStyleName && (
              <InvalidFieldNotice>請填入樣式名稱</InvalidFieldNotice>
            )}
            {existedStyleName && (
              <InvalidFieldNotice>
                樣式名稱已存在，請使用其他名稱！
              </InvalidFieldNotice>
            )}
            <StyleOptionsWrapper>
              <Select
                options={borderStyleOptions}
                onChange={handleBorderStyleChange}
                styles={SelectBorderStyles}
                //   value={borderStyleOptions.find(
                //     (option) => option.value === style.borderStyle
                //   )} // 設定選擇器的值
                placeholder="邊框樣式"
              />
              <ColorGroup>
                <RadiusIconWrapper
                  isSelected={style.borderRadius !== ""}
                  onClick={handleRadiusChange}
                >
                  <IconImage src={borderRadiusIcon} />
                </RadiusIconWrapper>
                <BorderStyleIconWrapper
                  onClick={handleOpenBorderWidthMenu}
                  isDisabled={style.borderStyle === "none"}
                >
                  <IconImage src={borderThicknessIcon} />
                </BorderStyleIconWrapper>
                <BorderStyleIconWrapper
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorIconClick(e, "borderColor");
                  }}
                  isDisabled={style.borderStyle === "none"}
                >
                  <IconImage src={borderColorIcon} />
                </BorderStyleIconWrapper>
                <IconWrapper
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorIconClick(e, "backgroundColor");
                  }}
                >
                  <IconImage src={backgroundColorIcon} />
                </IconWrapper>
              </ColorGroup>
              <Select
                options={fontOptions}
                onChange={handleFontChange}
                styles={SelectFont}
                value={fontOptions.find(
                  (option) => option.value === style.fontFamily
                )}
                placeholder="字體"
              />
              <Select
                options={animationOptions}
                onChange={handleAnimationChange}
                styles={SelectAnimation}
                value={animationOptions.find(
                  (option) => option.value === style.animation
                )}
                placeholder="動畫效果"
              />
            </StyleOptionsWrapper>
            <Card currentStyle={style} />
            {borderWidthPickerVisible && (
              <PickerContainer
                top={pickerPosition.top}
                left={pickerPosition.left}
                onClick={(e) => e.stopPropagation()}
              >
                <Select
                  options={borderWidthOptions}
                  onChange={handleBorderWidthChange}
                  value={borderWidthOptions.find(
                    (option) => option.value === style.borderWidth
                  )} // 設定選擇器的值
                />
              </PickerContainer>
            )}
            {/* TwitterPicker 懸浮容器 */}
            {style.borderStyle !== "none" && colorPickerVisible.borderColor && (
              <PickerContainer
                top={pickerPosition.top}
                left={pickerPosition.left}
              >
                <TwitterPicker
                  color={style.borderColor}
                  onChange={(color) => handleColorChange(color, "borderColor")}
                />
              </PickerContainer>
            )}
            {colorPickerVisible.backgroundColor && (
              <PickerContainer
                top={pickerPosition.top}
                left={pickerPosition.left}
              >
                <TwitterPicker
                  color={style.backgroundColor}
                  onChange={(color) =>
                    handleColorChange(color, "backgroundColor")
                  }
                  colors={defaultBackgroundColors}
                />
              </PickerContainer>
            )}
            <SaveButton
              type="submit"
              disabled={isSaving}
              $notAllowed={isSaving}
              value={isSaving ? "儲存中..." : "儲存樣式"}
            />
          </Form>
        </ModalContent>
      </ModalWrapper>
    </>
  );
};

export default NewStyleModal;
NewStyleModal.propTypes = {
  onClose: PropTypes.func,
  onStyleAdded: PropTypes.func,
  styleNames: PropTypes.array,
};

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
  margin-bottom: 30px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 16px;
`;

const InvalidFieldNotice = styled.p`
  font-size: 12px;
  color: red;
  margin-top: 5px;
`;

const StyleNameInput = styled.input`
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

const StyleOptionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 5px;
  margin-top: 30px;
  height: 50px;
  width: 100%;
  border: solid 1px #f3f3f3;
  @media only screen and (max-width: 939px) {
    flex-wrap: wrap;
    gap: 4px;
    height: fit-content;
  }
`;

const ColorGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const SelectBorderStyles = {
  control: (baseStyles) => ({
    ...baseStyles,
    width: "135px",
  }),
  option: (provided) => ({
    ...provided,
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1000, // 選單的 z-index，以防止被其他元素遮蓋
  }),
};

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  position: relative;
`;

const BorderStyleIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  cursor: ${(props) => (props.isDisabled ? "not-allowed" : "pointer")};
  position: relative;
`;

const RadiusIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border: ${(props) => (props.isSelected ? "1px solid #c1c0c0" : "none")};
  border-radius: ${(props) => (props.isSelected ? "5px" : "none")};
  cursor: pointer;
  position: relative;
`;

const IconImage = styled.img`
  width: 24px;
  height: 24px;
`;
const SelectFont = {
  control: (baseStyles) => ({
    ...baseStyles,
    width: "180px",
  }),
  option: (provided, state) => ({
    ...provided,
    fontFamily: state.data.value,
  }),
  singleValue: (provided, state) => ({
    ...provided,
    fontFamily: state.data.value,
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1000, // 選單的 z-index，以防止被其他元素遮蓋
  }),
};

const SelectAnimation = {
  control: (baseStyles) => ({
    ...baseStyles,
    width: "180px",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1000, // 選單的 z-index，以防止被其他元素遮蓋
  }),
};

const PickerContainer = styled.div`
  position: fixed; /* 懸浮在其他元素上 */
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  z-index: 1000; /* 確保在最上層 */
`;

const SaveButton = styled.input`
  margin-top: 8px;
  padding: 0 14px;
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
  cursor: ${(props) => (props.$notAllowed ? "not-allowed" : "pointer")};
  transition: all 0.3s ease-in-out;
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
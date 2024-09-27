import styled from "styled-components";
import PropTypes from "prop-types";
import Select from "react-select";
import { useEffect, useState } from "react";
import { TwitterPicker } from "react-color";
import { useUser } from "../../context/UserContext.jsx";

import borderRadiusIcon from "./images/borderRadius.png";
import borderThicknessIcon from "./images/lineThickness.png";
import borderColorIcon from "./images/borderColorIcon.png";
import backgroundColorIcon from "./images/backgroundColor.png";
import Card from "./Card";
import { saveCardStyle } from "../../utils/api.js";

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
  { value: "24px", label: "24px" },
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
  { value: "fade", label: "淡入淡出" },
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

const NewStyleModal = ({ onClose, onStyleAdded }) => {
  const { user, setUser } = useUser();
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

  const [colorPickerVisible, setColorPickerVisible] = useState({
    borderColor: false,
    backgroundColor: false,
  });

  const [borderWidthPickerVisible, setBorderWidthPickerVisible] =
    useState(false);

  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

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
      borderRadius: style.borderRadius === "25px" ? "" : "25px", // 切換選取狀態
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
    if (style.styleName === "") {
      setInvalidStyleName(true);
      return;
    } else {
      setInvalidStyleName(false);
      try {
        const newStyleId = await saveCardStyle({
          ...style,
          userId: user.userId,
        });
        alert("儲存樣式成功！");
        onStyleAdded(style, newStyleId);
        onClose();
      } catch (error) {
        console.error("儲存樣式失敗：", error);
        alert("儲存樣式失敗，請再試一次。");
      }
    }
  };

  return (
    <ModalWrapper onClick={closeAllPickers}>
      <ModalContent onClick={closeAllPickers}>
        <Heading>新增樣式</Heading>
        <CloseIcon onClick={onClose}>×</CloseIcon>
        <Form onSubmit={handleSubmit}>
          <Label htmlFor="styleName">樣式名稱</Label>
          <StyleNameInput
            id="styleName"
            onChange={(e) => setStyle({ ...style, styleName: e.target.value })}
          />
          {invalidStyleName && (
            <InvalidFieldNotice>請填入樣式名稱</InvalidFieldNotice>
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
              styles={SelectFont}
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
          <SaveButton type="submit" value="儲存樣式" />
        </Form>
      </ModalContent>
    </ModalWrapper>
  );
};

export default NewStyleModal;
NewStyleModal.propTypes = {
  onClose: PropTypes.func,
  onStyleAdded: PropTypes.func,
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
const PickerContainer = styled.div`
  position: fixed; /* 懸浮在其他元素上 */
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  z-index: 1000; /* 確保在最上層 */
`;

const SaveButton = styled.input`
  margin-top: 30px;
  width: 100px;
  height: 40px;
  font-size: 16px;
  align-self: center;
  font-size: "Noto Sans TC", sans-serif;
`;

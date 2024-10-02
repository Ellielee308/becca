import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { useState } from "react";
import imageIcon from "./images/photo.png";

export default function Preview({ currentStyle, currentTemplate }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prevState) => !prevState);
  };
  return (
    <Wrapper onClick={handleFlip}>
      <FlipCard isFlipped={isFlipped} currentStyle={currentStyle}>
        <FrontCard isFlipped={isFlipped} currentStyle={currentStyle}>
          {currentTemplate.frontFields.map((field, index) => (
            <FieldContainer
              key={index}
              $style={field.style}
              $position={field.position}
            >
              {renderFieldContent(field)}
            </FieldContainer>
          ))}
        </FrontCard>
        <BackCard isFlipped={isFlipped} currentStyle={currentStyle}>
          {currentTemplate.backFields.map((field, index) => (
            <FieldContainer
              key={index}
              $style={field.style}
              $position={field.position}
            >
              {renderFieldContent(field)}
            </FieldContainer>
          ))}
        </BackCard>
      </FlipCard>
    </Wrapper>
  );
}

Preview.propTypes = {
  currentTemplate: PropTypes.shape({
    templateName: PropTypes.string.isRequired,
    frontFields: PropTypes.arrayOf(
      PropTypes.shape({
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
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired,
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
  currentStyle: PropTypes.shape({
    styleId: PropTypes.string,
    userId: PropTypes.string.isRequired,
    styleName: PropTypes.string.isRequired,
    borderStyle: PropTypes.oneOf(["none", "solid", "dashed", "dotted"]),
    borderColor: PropTypes.string,
    borderWidth: PropTypes.string,
    borderRadius: PropTypes.string,
    backgroundColor: PropTypes.string.isRequired,
    fontFamily: PropTypes.string.isRequired,
    animation: PropTypes.oneOf(["verticalFlip", "horizontalFlip", "fade"])
      .isRequired,
  }).isRequired,
};

const renderFieldContent = (field) => {
  switch (field.type) {
    case "text":
      return field.name; // 渲染文字內容
    case "image":
      return (
        <ImageWrapper>
          <Image src={imageIcon} alt={field.name} style={field.style} />
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

const Wrapper = styled.div`
  align-self: center;
  display: block;
  margin: 52px 0px;
  width: 600px;
  height: 400px;
  perspective: 1000px;
  transform-style: preserve-3d;
  cursor: pointer;
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
  &:hover {
    transform: ${(props) => {
      switch (props.currentStyle.animation) {
        case "horizontalFlip":
          return props.isFlipped ? "rotateY(175deg)" : "rotateY(2deg)";
        case "fade":
          return "none";
        default: // "vertical"
          return props.isFlipped ? "rotateX(175deg)" : "rotateX(2deg)";
      }
    }};
    box-shadow: 0 20px 20px rgba(50, 60, 60, 0.2);
  }
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
  justify-content: ${(props) => props.$style.textAlign || "center"};
  align-items: center;
  ${(props) =>
    props.$style &&
    css`
      width: ${props.$style.width};
      height: ${props.$style.height};
      font-weight: ${props.$style.fontWeight};
      color: ${props.$style.color};
      font-style: ${props.$style.fontStyle};
      ${getResponsiveFontSize(props.$style.fontSize)};
    `}
  left: ${(props) => props.$position?.x};
  top: ${(props) => props.$position?.y};
  user-select: none;
`;
// 用於顯示圖片的樣式
const ImageWrapper = styled.div`
  position: relative;
  display: inline-block; // 讓 ImageWrapper 的大小與圖片保持一致
`;

const ImageName = styled.p`
  position: absolute;
  top: 50%; // 垂直居中
  left: 50%; // 水平居中
  transform: translate(-50%, -50%); // 將元素的中心點移動到其容器的中心
  margin: 0;
  padding: 8px 16px; // 內邊距讓文字不緊貼邊框
  background-color: rgba(0, 0, 0, 0.5); // 半透明的黑色背景
  color: white; // 文字顏色為白色
  border-radius: 4px; // 圓角邊框
  font-size: 14px; // 文字大小
  text-align: center;
  width: fit-content; // 讓內容決定寬度
  pointer-events: none; // 讓名稱不影響圖片的點擊操作
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: ${(props) => props.style?.objectFit || "cover"};
  display: block;
`;

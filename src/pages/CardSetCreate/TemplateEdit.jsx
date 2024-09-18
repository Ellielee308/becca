import styled from "styled-components";
import PropTypes from "prop-types";
import imageIcon from "./images/photo.png";

export default function TemplateEdit({ currentTemplate }) {
  return (
    <Wrapper>
      <Heading>模板欄位</Heading>
      <SideWrapper>
        <Side>
          <SideHeading>正面</SideHeading>
          {currentTemplate.templateName ? (
            currentTemplate.frontFields.map((frontField, index) => {
              if (frontField.type === "text") {
                return (
                  <TextInput
                    key={index} // 加入唯一的 key 屬性
                    placeholder={frontField.name} // 使用花括號
                    disabled
                  />
                );
              } else if (frontField.type === "image") {
                return (
                  <ImagePreviewWrapper key={index}>
                    <ImageFieldName>{frontField.name}</ImageFieldName>
                    <ImagePreview src={imageIcon} alt={frontField.name} />
                  </ImagePreviewWrapper>
                );
              }
              return null; // 處理其他類型，防止沒有 return 的情況
            })
          ) : (
            <TextInput placeholder="單字" disabled />
          )}
        </Side>
        <SideSplit />
        <Side>
          <SideHeading>背面</SideHeading>
          {currentTemplate.templateName ? (
            currentTemplate.backFields.map((backField, index) => {
              if (backField.type === "text") {
                return (
                  <TextInput
                    key={index} // 加入唯一的 key 屬性
                    placeholder={backField.name} // 使用花括號
                    disabled
                  />
                );
              } else if (backField.type === "image") {
                return (
                  <ImagePreviewWrapper key={index}>
                    <ImageFieldName>{backField.name}</ImageFieldName>
                    <ImagePreview src={imageIcon} alt={backField.name} />
                  </ImagePreviewWrapper>
                );
              }
              return null; // 處理其他類型，防止沒有 return 的情況
            })
          ) : (
            <TextInput placeholder="字義" disabled />
          )}
        </Side>
      </SideWrapper>
    </Wrapper>
  );
}

TemplateEdit.propTypes = {
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
};

const Wrapper = styled.div`
  align-self: center;
  margin: 20px 0px;
  padding: 35px 0px;
  border: 1px solid #c2c2c2;
  width: 600px;
  min-height: 250px;
`;

const Heading = styled.p`
  font-size: 24px;
  margin-bottom: 45px;
  margin-left: 30px;
`;

const SideWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: row;
`;

const Side = styled.div`
  padding: 0px 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const SideSplit = styled.div`
  height: 80px;
  border-left: 1px solid black;
`;

const SideHeading = styled.p`
  font-size: 18px;
  margin-bottom: 12px;
`;

const TextInput = styled.input`
  height: 30px;
  border: solid 1px #c1c0c0;
`;

const ImagePreviewWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ImageFieldName = styled.p`
  font-size: 14px;
  color: #636262;
`;

const ImagePreview = styled.img`
  height: 40px;
  width: auto;
  margin: 0 auto;
`;

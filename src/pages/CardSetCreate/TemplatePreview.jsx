import styled from "styled-components";
import PropTypes from "prop-types";
import imageIcon from "./images/photo.png";

export default function TemplatePreview({ currentTemplate }) {
  return (
    <Wrapper>
      <Heading>
        模板欄位<RequiredNotice> (紅字標記欄位為必填項) </RequiredNotice>
      </Heading>
      <SideWrapper>
        <Side>
          <SideHeading>正面</SideHeading>
          {currentTemplate.templateName ? (
            currentTemplate.frontFields.map((frontField, index) => {
              if (frontField.type === "text") {
                return (
                  <TextWrapper key={index} $isRequired={frontField.required}>
                    {frontField.name}
                  </TextWrapper>
                );
              } else if (frontField.type === "image") {
                return (
                  <ImagePreviewWrapper key={index}>
                    <ImageFieldName $isRequired={frontField.required}>
                      {frontField.name}
                    </ImageFieldName>
                    <ImagePreview src={imageIcon} alt={frontField.name} />
                  </ImagePreviewWrapper>
                );
              }
              return null;
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
                  <TextWrapper key={index} $isRequired={backField.required}>
                    {backField.name}
                  </TextWrapper>
                );
              } else if (backField.type === "image") {
                return (
                  <ImagePreviewWrapper key={index}>
                    <ImageFieldName $isRequired={backField.required}>
                      {backField.name}
                    </ImageFieldName>
                    <ImagePreview src={imageIcon} alt={backField.name} />
                  </ImagePreviewWrapper>
                );
              }
              return null;
            })
          ) : (
            <TextInput placeholder="字義" disabled />
          )}
        </Side>
      </SideWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  align-self: center;
  margin: 20px 0px;
  padding: 35px 0px;
  border: 1px solid #c2c2c2;
  width: 100%;
  max-width: 600px;
  min-height: 250px;
  border-radius: 8px;
`;

const Heading = styled.div`
  font-size: 24px;
  margin: 0 30px 45px 30px;
  display: flex;
  flex-wrap: wrap;
  align-items: end;
`;

const RequiredNotice = styled.span`
  font-size: 12px;
  margin-top: 8px;
`;

const SideWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  @media only screen and (max-width: 559px) {
    flex-direction: column;
  }
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
  border-left: 1px solid #c9c5c5;
  align-self: center;
  margin: 0px 30px;
  @media only screen and (max-width: 559px) {
    height: 0px;
    width: 20%;
    border-left: none;
    margin: 20px 0px;
  }
`;

const SideHeading = styled.p`
  font-size: 18px;
  margin-bottom: 12px;
`;

const TextInput = styled.input`
  height: 30px;
  border: solid 1px #c1c0c0;
`;

const TextWrapper = styled.div`
  min-height: 30px; /* 最小高度 */
  border: 1px solid #c1c0c0;
  border-radius: 4px;
  padding: 0 4px;
  font-size: 14px;
  line-height: 30px;
  color: ${(props) => (props.$isRequired ? "red" : "rgb(84, 84, 84)")};
  background-color: rgba(239, 239, 239, 0.3);
  user-select: none;
`;

const ImagePreviewWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const ImageFieldName = styled.p`
  font-size: 14px;
  color: ${(props) => (props.$isRequired ? "red" : "#636262")};
`;

const ImagePreview = styled.img`
  height: 40px;
  width: auto;
  margin: 0 auto;
`;

TemplatePreview.propTypes = {
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

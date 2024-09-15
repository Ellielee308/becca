import styled from "styled-components";

export default function TemplateEdit() {
  return (
    <Wrapper>
      <Heading>Example</Heading>
      <SideWrapper>
        <Side>
          <SideHeading>正面</SideHeading>
          <TextInput placeholder="單字" disabled />
        </Side>
        <SideSplit />
        <Side>
          <SideHeading>背面</SideHeading>
          <TextInput placeholder="字義" disabled />
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

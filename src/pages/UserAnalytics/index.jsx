import styled from "styled-components";

function UserAnalytics() {
  return (
    <Wrapper>
      <Title>學習狀況</Title>
      <Split />
    </Wrapper>
  );
}

export default UserAnalytics;

const Wrapper = styled.div`
  margin-top: 80px;
  padding: 0 20px;
`;

const Title = styled.h2`
  font-size: 28px;
`;

const Split = styled.div`
  margin-top: 16px;
  border-top: 1px solid #c9c9c9;
  width: 100%;
`;

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { search } from "../../utils/api";
import { useUser } from "../../context/UserContext";

function SearchResult() {
  const { keyword } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true); // 新增 loading 狀態

  useEffect(() => {
    // 每次開始新搜尋時，重置搜尋結果和 loading 狀態
    setSearchResults([]);
    setLoading(true);

    const fetchSearchResult = async () => {
      try {
        const searchResults = await search(keyword);
        if (searchResults.length > 0) {
          console.log("搜尋結果：", searchResults);
          if (user && user.userId) {
            const filteredSearchResults = searchResults.filter(
              (result) => result.userId !== user.userId
            );
            setSearchResults(filteredSearchResults);
          } else {
            setSearchResults(searchResults);
          }
        } else {
          console.log("查無搜尋結果");
        }
      } catch (error) {
        console.error("搜尋失敗：", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResult();
  }, [keyword, user]);

  if (loading) return <div>Loading...</div>; // 搜尋進行中顯示 loading 畫面

  if (!searchResults.length)
    return (
      <Wrapper>
        <Title>查無搜尋結果，換個關鍵字搜尋看看吧！</Title>
      </Wrapper>
    );

  return (
    <Wrapper>
      <Title>{`共找到 ${searchResults.length} 則搜尋結果`}</Title>
      <ResultWrapper>
        {searchResults.map((result, index) => (
          <Link key={index} to={`/cardset/${result.cardSetId}`}>
            <CardSetWrapper>
              <CardSetTitle>{result.title}</CardSetTitle>
              <CardSetDescription>{result.description}</CardSetDescription>
              <LabelWrapper>
                <LabelIconContainer>
                  <LabelIcon />
                </LabelIconContainer>
                <LabelNameContainer>
                  {result.labels.length > 0 ? (
                    result.labels.map((label, index) => (
                      <LabelName key={index}>
                        {label.name}
                        {index < result.labels.length - 1 && ", "}
                      </LabelName>
                    ))
                  ) : (
                    <LabelName>無標籤</LabelName>
                  )}
                </LabelNameContainer>
              </LabelWrapper>
            </CardSetWrapper>
          </Link>
        ))}
      </ResultWrapper>
    </Wrapper>
  );
}
export default SearchResult;

const Wrapper = styled.div`
  margin: 80px auto;
  padding: 30px 20px;
  max-width: 1160px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 800px;
`;

const Title = styled.h2`
  font-size: 16px;
`;

const ResultWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
`;

const CardSetWrapper = styled.div`
  padding: 20px 20px 10px 20px;
  width: 400px;
  height: 150px;
  display: flex;
  flex-direction: column;
  background-color: aliceblue;
  border-radius: 8px;
`;

const CardSetTitle = styled.p`
  font-size: 24px;
  margin-bottom: 14px;
`;

const CardSetDescription = styled.p`
  font-size: 14px;
`;

const LabelWrapper = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LabelIconContainer = styled.div`
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
`;

const LabelNameContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const LabelName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
`;

const LabelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path
      fillRule="evenodd"
      d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
      clipRule="evenodd"
    />
  </svg>
);

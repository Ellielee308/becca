import styled from "styled-components";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { search, getUserDocument } from "../../utils/api";

function SearchResult() {
  const { keyword } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // 每次開始新搜尋時，重置搜尋結果和 loading 狀態
    setSearchResults([]);
    setLoading(true);

    const fetchSearchResult = async () => {
      try {
        const searchResults = await search(keyword);
        if (searchResults.length > 0) {
          // 獲取每個 cardSet 中的 userId，並通過 getUserDocument 獲取對應的 username 和 profilePicture
          const searchResultsWithUserDetails = await Promise.all(
            searchResults.map(async (cardSet) => {
              const userDoc = await getUserDocument(cardSet.userId);
              return {
                ...cardSet,
                username: userDoc.username,
                profilePicture: userDoc.profilePicture,
              };
            })
          );
          console.log("搜尋結果：", searchResultsWithUserDetails);
          setSearchResults(searchResultsWithUserDetails);
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
  }, [keyword]);

  if (loading) return <div>Loading...</div>; // 搜尋進行中顯示 loading 畫面
  return (
    <Background>
      <Wrapper>
        <Title>
          <LabelIcon />
          {keyword}
        </Title>
        <ResultWrapper>
          {searchResults.length === 0 ? (
            <NoFoundNote>查無搜尋結果，換個關鍵字搜尋看看吧！</NoFoundNote>
          ) : (
            searchResults.map((result, index) => (
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
                  <OwnerInfoContainer>
                    <ProfilePicture
                      src={result.profilePicture}
                      alt={`${result.username}'s avatar`}
                    />
                    <Username>{result.username}</Username>
                    <Number>{result.cardOrder.length}張字卡</Number>
                  </OwnerInfoContainer>
                </CardSetWrapper>
              </Link>
            ))
          )}
        </ResultWrapper>
      </Wrapper>
    </Background>
  );
}
export default SearchResult;

const Background = styled.div`
  background-color: rgb(225, 229, 242);
  height: fit-content;
  padding: 80px 14px 20px 14px;
`;

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 20px 60px;
  max-width: 1160px;
  min-height: calc(100vh - 120px);
`;

const Title = styled.h2`
  display: flex;
  font-size: 20px;
  gap: 8px;
  color: rgb(40, 46, 62);
  font-weight: 500;
`;

const NoFoundNote = styled.p`
  font-size: 20px;
`;

const ResultWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  gap: 16px;
  margin-top: 20px;
  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const CardSetWrapper = styled.div`
  width: 100%;
  padding: 20px 20px 12px 20px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: rgb(250, 247, 245);
  border-radius: 8px;
  border: 1px solid #e6e3e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 柔和的陰影 */
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1); /* Hover 時陰影增強 */
    /* transform: translateY(-4px); 提升視覺上的立體感 */
  }
`;

const CardSetTitle = styled.p`
  font-size: 24px;
  margin-bottom: 14px;
`;

const CardSetDescription = styled.p`
  font-size: 14px;
`;

const LabelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LabelIconContainer = styled.div`
  width: 24px;
  height: 24px;
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

const OwnerInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ProfilePicture = styled.img`
  margin-right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;
const Username = styled.p`
  color: #22254c;
`;

const Number = styled.div`
  margin-left: auto;
  background-color: #3d5a80;
  border-radius: 50px; /* 使其更圓潤 */
  color: #ffffff;
  padding: 6px 14px;
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

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

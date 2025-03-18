import { BlogPost } from '../types';

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '와인 초보자를 위한 기본 가이드',
    slug: 'wine-beginners-guide',
    featured_image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    content: `
      <h2>와인의 세계에 오신 것을 환영합니다</h2>
      <p>와인은 수천 년의 역사를 가진 음료로, 전 세계 수많은 사람들에게 사랑받고 있습니다. 하지만 처음 와인을 접하는 분들에게는 다양한 종류와 용어들이 복잡하게 느껴질 수 있습니다.</p>
      
      <h3>와인의 기본 종류</h3>
      <p><strong>레드 와인</strong>: 포도 껍질과 함께 발효시켜 만든 와인으로, 탄닌이 풍부하고 바디감이 있습니다.</p>
      <p><strong>화이트 와인</strong>: 포도 껍질을 제거한 후 발효시켜 만든 와인으로, 상대적으로 가볍고 산미가 있습니다.</p>
      <p><strong>로제 와인</strong>: 레드 와인 제조 과정에서 포도 껍질과의 접촉 시간을 짧게 하여 만든 분홍빛 와인입니다.</p>
      <p><strong>스파클링 와인</strong>: 이산화탄소가 포함된 발포성 와인으로, 샴페인이 대표적입니다.</p>
      
      <h3>와인 테이스팅의 기본 단계</h3>
      <ol>
        <li><strong>시각(Look)</strong>: 와인의 색상과 투명도를 관찰합니다.</li>
        <li><strong>후각(Smell)</strong>: 와인의 아로마를 맡아봅니다.</li>
        <li><strong>미각(Taste)</strong>: 와인을 입에 머금고 맛과 질감을 느껴봅니다.</li>
      </ol>
      
      <h3>초보자를 위한 추천 와인</h3>
      <ul>
        <li>피노 누아(Pinot Noir): 가볍고 과일향이 풍부한 레드 와인</li>
        <li>소비뇽 블랑(Sauvignon Blanc): 상큼하고 산뜻한 화이트 와인</li>
        <li>모스카토(Moscato): 달콤하고 가벼운 스파클링 와인</li>
      </ul>
      
      <p>와인은 경험을 통해 배우는 것이 가장 좋습니다. 다양한 와인을 시도해보고, 자신만의 취향을 발견해보세요!</p>
    `,
    excerpt: '와인을 처음 접하는 분들을 위한 기본 가이드. 와인의 종류, 테이스팅 방법, 초보자를 위한 추천 와인까지 알아봅니다.',
    category: 'wine-info',
    hashtags: ['와인정보', '와인추천', '와인상식'],
    author_id: 'admin1',
    author: {
      id: 'admin1',
      nickname: '와인마스터',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'admin',
      email: 'admin@example.com',
      created_at: '2023-01-01T00:00:00Z',
      active: true
    },
    published: true,
    published_at: '2024-02-15T09:00:00Z',
    created_at: '2024-02-14T15:30:00Z',
    updated_at: '2024-02-14T15:30:00Z',
    view_count: 1250,
    likes_count: 48,
    comments_count: 12
  },
  {
    id: '2',
    title: '서울 강남 지역 콜키지 프리 레스토랑 TOP 5',
    slug: 'top-5-corkage-free-restaurants-gangnam',
    featured_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    content: `
      <h2>나만의 와인을 가지고 방문할 수 있는 강남 지역 레스토랑</h2>
      <p>콜키지 프리(Corkage Free) 서비스를 제공하는 레스토랑은 와인 애호가들에게 큰 매력으로 다가옵니다. 직접 고른 와인을 가져가 특별한 식사를 즐길 수 있기 때문이죠. 오늘은 서울 강남 지역에서 콜키지 프리 서비스를 제공하는 TOP 5 레스토랑을 소개합니다.</p>
      
      <h3>1. 비스트로 드 서울</h3>
      <p>프렌치 요리를 전문으로 하는 이 레스토랑은 평일 저녁에 콜키지 프리 서비스를 제공합니다. 소믈리에가 상주하여 와인에 어울리는 요리를 추천해 드립니다.</p>
      <p><strong>주소</strong>: 서울시 강남구 신사동 123-45</p>
      <p><strong>영업시간</strong>: 17:30 - 23:00 (월요일 휴무)</p>
      
      <h3>2. 트라토리아 일 소르소</h3>
      <p>정통 이탈리안 요리를 맛볼 수 있는 이 레스토랑은 매주 화요일과 수요일에 콜키지 프리 서비스를 제공합니다. 수제 파스타와 함께 즐기는 와인의 맛이 일품입니다.</p>
      <p><strong>주소</strong>: 서울시 강남구 청담동 456-78</p>
      <p><strong>영업시간</strong>: 11:30 - 22:00 (연중무휴)</p>
      
      <h3>3. 더 스테이크 하우스</h3>
      <p>최상급 스테이크를 제공하는 이 레스토랑은 매일 저녁 콜키지 프리 서비스를 제공합니다. 레드 와인과 완벽한 조화를 이루는 스테이크를 경험해보세요.</p>
      <p><strong>주소</strong>: 서울시 강남구 삼성동 789-10</p>
      <p><strong>영업시간</strong>: 17:00 - 23:30 (일요일 휴무)</p>
      
      <h3>4. 라 테라스</h3>
      <p>루프톱 테라스가 있는 이 레스토랑은 주말에 콜키지 프리 서비스를 제공합니다. 강남의 야경을 바라보며 와인을 즐길 수 있는 로맨틱한 장소입니다.</p>
      <p><strong>주소</strong>: 서울시 강남구 논현동 234-56</p>
      <p><strong>영업시간</strong>: 18:00 - 01:00 (월요일, 화요일 휴무)</p>
      
      <h3>5. 모던 한식당 '채움'</h3>
      <p>현대적으로 재해석한 한식을 제공하는 이 레스토랑은 예약 시 콜키지 프리 서비스를 제공합니다. 한식과 와인의 색다른 페어링을 경험해보세요.</p>
      <p><strong>주소</strong>: 서울시 강남구 역삼동 345-67</p>
      <p><strong>영업시간</strong>: 12:00 - 22:00 (연중무휴)</p>
      
      <p>각 레스토랑마다 콜키지 서비스 조건이 다를 수 있으니, 방문 전 반드시 확인하시기 바랍니다. 특별한 날, 소중한 와인과 함께 멋진 식사를 즐겨보세요!</p>
    `,
    excerpt: '서울 강남 지역에서 콜키지 프리 서비스를 제공하는 TOP 5 레스토랑을 소개합니다. 나만의 와인을 가지고 방문해 특별한 식사를 즐겨보세요.',
    category: 'restaurant-news',
    hashtags: ['레스토랑소식', '콜키지팁', '와인페어링'],
    author_id: 'user1',
    author: {
      id: 'user1',
      nickname: '맛집탐험가',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'user',
      email: 'user1@example.com',
      created_at: '2023-02-15T00:00:00Z',
      active: true
    },
    published: true,
    published_at: '2024-03-01T10:30:00Z',
    created_at: '2024-02-28T14:20:00Z',
    updated_at: '2024-02-28T14:20:00Z',
    view_count: 980,
    likes_count: 35,
    comments_count: 8
  },
  {
    id: '3',
    title: '콜키지 매너와 에티켓: 알아두면 좋은 팁',
    slug: 'corkage-manners-and-etiquette',
    featured_image: 'https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    content: `
      <h2>콜키지 서비스를 이용할 때 알아두면 좋은 매너와 에티켓</h2>
      <p>콜키지(Corkage) 서비스는 고객이 직접 가져온 와인을 레스토랑에서 마실 수 있게 해주는 서비스입니다. 하지만 이 서비스를 이용할 때는 몇 가지 매너와 에티켓을 지키는 것이 중요합니다. 오늘은 콜키지 서비스를 이용할 때 알아두면 좋은 팁들을 소개합니다.</p>
      
      <h3>1. 사전에 콜키지 정책 확인하기</h3>
      <p>레스토랑마다 콜키지 정책이 다릅니다. 방문 전에 전화나 웹사이트를 통해 콜키지 가능 여부, 비용, 병 수 제한 등을 확인하세요.</p>
      
      <h3>2. 레스토랑에서 판매하지 않는 와인 가져가기</h3>
      <p>레스토랑의 와인 리스트에 있는 와인을 직접 가져가는 것은 예의에 어긋납니다. 해당 레스토랑에서 구하기 어려운 특별한 와인이나 개인적으로 의미 있는 와인을 가져가는 것이 좋습니다.</p>
      
      <h3>3. 적절한 와인 선택하기</h3>
      <p>레스토랑의 요리 스타일과 어울리는 와인을 선택하세요. 이탈리안 레스토랑에 프랑스 보르도 와인을, 스테이크 하우스에 가벼운 화이트 와인을 가져가는 것은 조화롭지 않을 수 있습니다.</p>
      
      <h3>4. 와인 서빙에 감사하기</h3>
      <p>직원이 와인을 따르고 적절한 글라스를 제공해주는 것에 감사의 마음을 표현하세요. 콜키지 비용은 단순히 와인을 열어주는 비용이 아니라 서비스, 글라스 제공, 세척 등의 비용을 포함합니다.</p>
      
      <h3>5. 소믈리에에게 와인 소개하기</h3>
      <p>가져간 와인에 대해 소믈리에에게 간략히 소개하는 것은 좋은 대화의 시작점이 될 수 있습니다. 특별한 와인이라면 그 이유를 공유해보세요.</p>
      
      <h3>6. 적절한 팁 남기기</h3>
      <p>콜키지 서비스를 이용했다면, 일반적인 팁보다 조금 더 후하게 팁을 남기는 것이 좋습니다. 특히 콜키지 비용이 없거나 저렴한 경우에는 더욱 그렇습니다.</p>
      
      <h3>7. 빈 병 처리하기</h3>
      <p>특별한 빈티지나 기념일용 와인이 아니라면, 빈 병을 가져갈 필요는 없습니다. 레스토랑에서 처리하도록 맡기세요.</p>
      
      <p>콜키지 서비스는 와인 애호가들에게 좋은 기회이지만, 레스토랑의 입장에서는 추가적인 서비스를 제공하는 것입니다. 상호 존중과 이해를 바탕으로 즐거운 식사 경험을 만들어보세요.</p>
    `,
    excerpt: '콜키지 서비스를 이용할 때 알아두면 좋은 매너와 에티켓을 소개합니다. 사전 확인부터 적절한 와인 선택, 서비스에 대한 감사 표현까지 알아봅니다.',
    category: 'corkage-tips',
    hashtags: ['콜키지팁', '와인상식', '레스토랑소식'],
    author_id: 'admin1',
    author: {
      id: 'admin1',
      nickname: '와인마스터',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'admin',
      email: 'admin@example.com',
      created_at: '2023-01-01T00:00:00Z',
      active: true
    },
    published: true,
    published_at: '2024-02-20T11:15:00Z',
    created_at: '2024-02-18T16:45:00Z',
    updated_at: '2024-02-18T16:45:00Z',
    view_count: 1560,
    likes_count: 72,
    comments_count: 15
  },
  {
    id: '4',
    title: '2024 서울 와인 페스티벌 안내',
    slug: '2024-seoul-wine-festival',
    featured_image: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    content: `
      <h2>2024 서울 와인 페스티벌에 여러분을 초대합니다</h2>
      <p>와인 애호가들을 위한 최대 규모의 행사, 2024 서울 와인 페스티벌이 다음 달 코엑스에서 개최됩니다. 전 세계 다양한 와인을 한자리에서 만나볼 수 있는 이번 행사에 대한 모든 정보를 알려드립니다.</p>
      
      <h3>행사 개요</h3>
      <ul>
        <li><strong>일시</strong>: 2024년 5월 10일(금) ~ 12일(일), 10:00 ~ 18:00</li>
        <li><strong>장소</strong>: 코엑스 D홀</li>
        <li><strong>입장료</strong>: 1일권 30,000원 (시음 쿠폰 10매 포함)</li>
        <li><strong>주최</strong>: 한국와인협회, 서울시</li>
      </ul>
      
      <h3>주요 프로그램</h3>
      <ol>
        <li><strong>와인 시음회</strong>: 20개국 100여 개 와이너리의 500종 이상의 와인 시음</li>
        <li><strong>마스터 클래스</strong>: 국내외 유명 소믈리에와 와인 전문가들의 특별 강연</li>
        <li><strong>와인 & 푸드 페어링</strong>: 와인과 어울리는 다양한 음식 체험</li>
        <li><strong>블라인드 테이스팅 대회</strong>: 일반인도 참가 가능한 블라인드 테이스팅 콘테스트</li>
        <li><strong>와인 경매</strong>: 희귀 빈티지 와인 경매 (수익금 일부는 자선단체 기부)</li>
      </ol>
      
      <h3>특별 이벤트</h3>
      <p><strong>EasyCorkage 회원 특별 할인</strong>: EasyCorkage 앱 회원은 입장료 20% 할인 혜택을 드립니다. 앱 내 쿠폰을 제시해주세요.</p>
      <p><strong>와인 구매 특전</strong>: 페스티벌 기간 중 와인 구매 시 특별 할인 및 무료 배송 서비스 제공</p>
      <p><strong>인스타그램 이벤트</strong>: 해시태그 #서울와인페스티벌2024 #이지콜키지 로 인증샷을 올리면 추첨을 통해 프리미엄 와인 증정</p>
      
      <h3>참가 와이너리</h3>
      <p>이번 페스티벌에는 프랑스, 이탈리아, 스페인, 미국, 칠레, 아르헨티나, 호주 등 전 세계 유명 와이너리들이 참가합니다. 특히 올해는 한국 와이너리 섹션이 확대되어 국내에서 생산되는 다양한 와인도 만나보실 수 있습니다.</p>
      
      <h3>티켓 구매 방법</h3>
      <p>티켓은 공식 웹사이트(www.seoulwinefestival.com)에서 사전 예매하실 수 있으며, 현장 구매도 가능합니다. 단, 인기 마스터 클래스는 조기 매진될 수 있으니 서둘러 예매하시기 바랍니다.</p>
      
      <p>와인을 사랑하는 모든 분들에게 잊지 못할 경험이 될 이번 페스티벌에 많은 관심과 참여 부탁드립니다. 다양한 와인을 시음하고, 전문가들의 이야기를 들으며, 와인 문화를 함께 즐겨보세요!</p>
    `,
    excerpt: '2024 서울 와인 페스티벌이 다음 달 코엑스에서 개최됩니다. 전 세계 500종 이상의 와인 시음, 마스터 클래스, 와인 경매 등 다양한 프로그램이 준비되어 있습니다.',
    category: 'events',
    hashtags: ['이벤트', '와인정보', '와인추천'],
    author_id: 'user2',
    author: {
      id: 'user2',
      nickname: '와인러버',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'user',
      email: 'user2@example.com',
      created_at: '2023-03-10T00:00:00Z',
      active: true
    },
    published: true,
    published_at: '2024-04-01T09:00:00Z',
    created_at: '2024-03-28T13:40:00Z',
    updated_at: '2024-03-28T13:40:00Z',
    view_count: 750,
    likes_count: 28,
    comments_count: 6
  }
];
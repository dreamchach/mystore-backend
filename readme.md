# 배포 시 사용한 사이트
https://app.cloudtype.io/

# 배포 시 생긴 문제
>Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)
https://okky.kr/questions/455222

>MongooseServerSelectionError: 
Could not connect to any servers in your MongoDB Atlas cluster. 

https://japing.tistory.com/entry/Nodejs-Mongoose-MongooseServerSelectionError-Could-not-connect-to-any-servers-in-your-MongoDB-Atlas-cluster

# 레퍼런스한 api 목록
https://github.com/KDT1-FE/KDT3-M4

# API

## 1. 공통

### 1. 이미지 업로드

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/products/image
  \ -X 'POST'
```

#### 요청 데이터
파일 형식으로 전송
```javascript
let formData = new FormData()
const config = {
    headers:{'Content-Type' : 'multipart/form-data'}
}

formData.append('file', files[0])

const response = instance.post('/products/image', formData, config)

// 프론트엔드에서의
formData.append('aaa', files[0])
// 백엔드에서의
upload.single('aaa')

// 'aaa'는 서로 동일해야 함
```

## 2. 인증

### 1. 회원가입

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/auth/signup
  \ -X 'POST'
```

#### 요청 데이터
```javascript
{
    // 필수 입력
    email : string,
    password : string,
    displayName : string,

    // 선택 입력
    profileImgBase64? : string
}
```

### 2. 로그인

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/auth/login
  \ -X 'POST'
```

#### 요청 데이터
```javascript
{
    // 필수 입력
    email : string,
    password : string,
}
```

### 3. 인증 확인

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/auth/me
  \ -X 'GET'
  \ -H 'authorization : bearer <accessToken>'
```

### 4. 로그아웃

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/auth/logout
  \ -X 'GET'
  \ -H 'authorization : bearer <accessToken>'
```

### 5. 사용자 정보 수정

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/auth/user
  \ -X 'PUT'
  \ -H 'authorization : bearer <accessToken>'
```

#### 요청 데이터
```javascript
{
    // 선택 입력
    profileImgBase64? : string,
    oldPassword? : string,
    newPassword? : string
}
```

## 3. 제품

### 1. 제품 추가 (관리자)

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/products
  \ -X 'POST'
  \ -H 'authorization : bearer <accessToken>'
  \ -H 'masterkey : true'
```

#### 요청 데이터
```javascript
{
    // 필수 입력
    title : string,
    price : number,
    description : string,
    desc : string,

    // 선택 입력
    tags? : string,
    thumbnail? : string,
    photo? : string
}
```

### 2. 모든 제품 조회 (관리자)

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/products
  \ -X 'GET'
  \ -H 'authorization : bearer <accessToken>'
  \ -H 'masterkey : true'
```

### 3. 제품 수정 (관리자)

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/:productId
  \ -X 'PUT'
  \ -H 'authorization : bearer <accessToken>'
  \ -H 'masterkey : true'
```

#### 요청 데이터
```javascript
{
    // 선택 입력
    title? : string,
    price? : number,
    description? : string,
    desc? : string,
    tags? : string,
    thumbnail? : string,
    photo? : string,
    isSoldOut? : string
}
```

### 4. 제품 삭제 (관리자)

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/:productId
  \ -X 'DELETE'
  \ -H 'authorization : bearer <accessToken>'
  \ -H 'masterkey : true'
```

### 5. 제품 검색

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/search
  \ -X 'POST'
```

#### 요청 데이터
```javascript
{
    // 선택 입력
    searchTag? : string,
}
```

### 6. 단일 제품 상세 조회

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/:productId
  \ -X 'GET'
```

### 7. 제품 거래(구매) 신청

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/buy
  \ -X 'POST'
  \ -H 'authorization : bearer <accessToken>'
```

#### 요청 데이터
```javascript
{
    email : string,
    productId : string,
}
```

### 8. 제품 거래(구매) 취소

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/cancel
  \ -X 'POST'
  \ -H 'authorization : bearer <accessToken>'
```

#### 요청 데이터
```javascript
{
    detailId : string
}
```

### 9. 제품 거래(구매) 확정

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/ok
  \ -X 'POST'
  \ -H 'authorization : bearer <accessToken>'
```

#### 요청 데이터
```javascript
{
    detailId : string,
    productId : string
}
```

### 10. 제품 전체 거래(구매) 내역

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/transactions/details
  \ -X 'POST'
  \ -H 'authorization : bearer <accessToken>'
```

#### 요청 데이터
```javascript
{
    email : string
}
```

### 11. 단일 제품 상세 거래(구매) 내역

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/transactions/detail
  \ -X 'POST'
  \ -H 'authorization : bearer <accessToken>'
```

#### 요청 데이터
```javascript
{
    detailId : string
}
```

### 12. 전체 거래(판매) 내역 (관리자)

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/transactions/all
  \ -X 'GET'
  \ -H 'authorization : bearer <accessToken>'
  \ -H 'masterkey : true'
```

### 13. 거래(판매) 내역 완료/취소 및 해제 (관리자)

#### 요구사항
```
curl https://port-0-mystore-backend-koh2xlj3ufoqd.sel4.cloudtype.app/api/transactions/:detailId
  \ -X 'PUT'
  \ -H 'authorization : bearer <accessToken>'
  \ -H 'masterkey : true'
```

#### 요청 데이터
```javascript
{
    isCanceled : boolean,
    done : boolean
}
```
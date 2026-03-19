export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "서울메이트 API",
    version: "0.1.0",
    description:
      "서울의 관광지 기반 장소 탐색, 일기 작성, 좋아요/스크랩 기능을 제공하는 서울메이트 백엔드 API 명세입니다.",
  },
  servers: [{ url: "/api", description: "Next.js API Routes" }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Supabase access_token (localStorage.access_token)",
      },
    },
    schemas: {
      Place: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          district: { type: "string", nullable: true },
          address: { type: "string", nullable: true },
          newAddress: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          homepage: { type: "string", nullable: true },
          tags: { type: "array", items: { type: "string" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PlaceWithLike: {
        allOf: [
          { $ref: "#/components/schemas/Place" },
          {
            type: "object",
            properties: {
              likeCount: { type: "integer" },
              liked: { type: "boolean" },
            },
          },
        ],
      },
      Diary: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          placeId: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      DiaryWithLikeScrap: {
        allOf: [
          { $ref: "#/components/schemas/Diary" },
          {
            type: "object",
            properties: {
              likeCount: { type: "integer" },
              liked: { type: "boolean" },
              scrapped: { type: "boolean" },
            },
          },
        ],
      },
      PaginatedPlaces: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/PlaceWithLike" } },
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
        },
      },
      PaginatedDiaries: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/DiaryWithLikeScrap" } },
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
        },
      },
      AuthSession: {
        type: "object",
        properties: {
          user: { type: "object" },
          session: {
            type: "object",
            properties: {
              access_token: { type: "string" },
              token_type: { type: "string" },
              expires_in: { type: "integer" },
            },
          },
        },
      },
      ToggleResponse: {
        type: "object",
        properties: {
          liked: { type: "boolean" },
          scrapped: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    // ──────────────── Auth ────────────────
    "/auth/sign-in": {
      post: {
        tags: ["Auth"],
        summary: "로그인",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "로그인 성공",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthSession" } },
            },
          },
          "400": { description: "잘못된 이메일/비밀번호" },
        },
      },
    },
    "/auth/sign-up": {
      post: {
        tags: ["Auth"],
        summary: "회원가입",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "회원가입 성공 (자동 로그인 세션 포함)",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthSession" } },
            },
          },
          "400": { description: "유효하지 않은 요청" },
        },
      },
    },

    // ──────────────── Places ────────────────
    "/places": {
      get: {
        tags: ["Places"],
        summary: "장소 목록 조회 (검색/필터)",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "검색어" },
          { name: "district", in: "query", schema: { type: "string" }, description: "자치구" },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        security: [{}],
        responses: {
          "200": {
            description: "장소 목록",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PaginatedPlaces" } },
            },
          },
        },
      },
    },
    "/places/{id}": {
      get: {
        tags: ["Places"],
        summary: "장소 상세 조회",
        security: [{}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "장소 상세",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PlaceWithLike" } },
            },
          },
          "404": { description: "장소 없음" },
        },
      },
    },
    "/places/{id}/like": {
      post: {
        tags: ["Places"],
        summary: "장소 좋아요 토글",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "토글 결과",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ToggleResponse" } },
            },
          },
          "401": { description: "인증 필요" },
          "404": { description: "장소 없음" },
        },
      },
    },
    "/places/trending": {
      get: {
        tags: ["Places"],
        summary: "인기 장소 목록 (좋아요 순)",
        security: [{}],
        parameters: [
          { name: "district", in: "query", schema: { type: "string" }, description: "자치구 필터" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          "200": {
            description: "인기 장소 목록",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/PlaceWithLike" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/places/liked": {
      get: {
        tags: ["Places"],
        summary: "내가 좋아요한 장소 목록",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "좋아요한 장소 목록",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PaginatedPlaces" } },
            },
          },
          "401": { description: "인증 필요" },
        },
      },
    },
    "/places/{id}/diaries": {
      get: {
        tags: ["Places"],
        summary: "특정 장소에 달린 일기 목록",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "일기 목록",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PaginatedDiaries" } },
            },
          },
        },
      },
    },

    // ──────────────── Diaries ────────────────
    "/diaries": {
      get: {
        tags: ["Diaries"],
        summary: "일기 목록 조회",
        parameters: [
          { name: "placeId", in: "query", schema: { type: "string" }, description: "장소 ID 필터" },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "일기 목록",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PaginatedDiaries" } },
            },
          },
        },
      },
      post: {
        tags: ["Diaries"],
        summary: "일기 작성",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["placeId", "title", "content"],
                properties: {
                  placeId: { type: "string" },
                  title: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "생성된 일기",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Diary" } },
            },
          },
          "400": { description: "잘못된 요청" },
          "401": { description: "인증 필요" },
          "404": { description: "장소 없음" },
        },
      },
    },
    "/diaries/{id}": {
      get: {
        tags: ["Diaries"],
        summary: "일기 상세 조회",
        security: [{}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "일기 상세 (liked, scrapped 포함)",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/DiaryWithLikeScrap" } },
            },
          },
          "404": { description: "일기 없음" },
        },
      },
      patch: {
        tags: ["Diaries"],
        summary: "일기 수정",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "수정된 일기",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Diary" } },
            },
          },
          "401": { description: "인증 필요" },
          "403": { description: "권한 없음" },
          "404": { description: "일기 없음" },
        },
      },
      delete: {
        tags: ["Diaries"],
        summary: "일기 삭제",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "204": { description: "삭제 성공" },
          "401": { description: "인증 필요" },
          "403": { description: "권한 없음" },
          "404": { description: "일기 없음" },
        },
      },
    },
    "/diaries/{id}/like": {
      post: {
        tags: ["Diaries"],
        summary: "일기 좋아요 토글",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "토글 결과",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ToggleResponse" } },
            },
          },
          "401": { description: "인증 필요" },
          "404": { description: "일기 없음" },
        },
      },
    },
    "/diaries/{id}/scrap": {
      post: {
        tags: ["Diaries"],
        summary: "일기 스크랩 토글",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "토글 결과",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ToggleResponse" } },
            },
          },
          "401": { description: "인증 필요" },
          "404": { description: "일기 없음" },
        },
      },
    },
    "/diaries/{id}/related": {
      get: {
        tags: ["Diaries"],
        summary: "관련 일기 목록 (같은 장소, 현재 일기 제외)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 5 } },
        ],
        responses: {
          "200": {
            description: "관련 일기 목록",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Diary" },
                    },
                  },
                },
              },
            },
          },
          "404": { description: "일기 없음" },
        },
      },
    },
    "/diaries/mine": {
      get: {
        tags: ["Diaries"],
        summary: "내가 작성한 일기 목록",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "내 일기 목록",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PaginatedDiaries" } },
            },
          },
          "401": { description: "인증 필요" },
        },
      },
    },
    "/diaries/scraps": {
      get: {
        tags: ["Diaries"],
        summary: "내가 스크랩한 일기 목록",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "스크랩한 일기 목록",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PaginatedDiaries" } },
            },
          },
          "401": { description: "인증 필요" },
        },
      },
    },

    // ──────────────── Admin ────────────────
    "/admin/sync-places": {
      post: {
        tags: ["Admin"],
        summary: "서울 공공 OpenAPI 장소 동기화",
        description: "서울 관광지 OpenAPI(TbVwAttractions)에서 데이터를 받아 DB에 upsert합니다.",
        parameters: [
          {
            name: "debug",
            in: "query",
            schema: { type: "integer", enum: [0, 1] },
            description: "1로 설정하면 첫 번째 row 원본 데이터를 응답에 포함",
          },
          {
            name: "onlyFirstPage",
            in: "query",
            schema: { type: "integer", enum: [0, 1] },
            description: "1로 설정하면 1페이지만 처리 (개발/디버그용)",
          },
        ],
        responses: {
          "200": {
            description: "동기화 결과",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    upserted: { type: "integer" },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ──────────────── Health ────────────────
    "/health": {
      get: {
        tags: ["System"],
        summary: "헬스 체크",
        responses: {
          "200": {
            description: "정상",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean" } },
                },
              },
            },
          },
        },
      },
    },
  },
};

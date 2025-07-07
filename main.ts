import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// API configuration
const API_BASE_URL = "http://www.law.go.kr/DRF";
// OC parameter from environment variable or default
const DEFAULT_OC = Deno.env.get("LAW_API_OC") ?? "";

// Tool schemas
const SearchLawSchema = z.object({
  query: z.string().describe("검색할 법령명 또는 내용"),
  type: z.enum(["law", "ordinance"]).optional().default("law").describe("검색 유형: law=법령(기본값), ordinance=자치법규(조례)"),
  page: z.number().optional().default(1).describe("페이지 번호"),
  display: z.number().optional().default(20).describe("페이지당 결과 수 (최대 100)"),
  search: z.number().optional().default(1).describe("검색 범위: 1=법령명(기본값), 2=본문검색"),
  sort: z.enum(["lasc", "ldes", "dasc", "ddes", "nasc", "ndes", "efasc", "efdes"]).optional().default("lasc").describe("정렬 옵션: lasc=법령명 오름차순, ldes=법령명 내림차순, dasc=공포일자 오름차순, ddes=공포일자 내림차순 등"),
});

const GetLawDetailsSchema = z.object({
  lawId: z.string().optional().describe("법령/자치법규 ID (예: '001638' - 도로교통법, '2026666' - 자치법규)"),
  mst: z.string().optional().describe("법령/자치법규 일련번호 (예: '266639' - 법령, '1316146' - 자치법규)"),
  type: z.enum(["law", "ordinance"]).optional().default("law").describe("조회 유형: law=법령(기본값), ordinance=자치법규(조례)"),
}).refine((data) => data.lawId || data.mst, {
  message: "lawId 또는 mst 중 하나는 필수입니다",
});

// Initialize MCP server
const server = new Server(
  {
    name: "law-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, () => {
  return {
    tools: [
      {
        name: "search_laws",
        description: "한국 법령 및 자치법규(조례)를 검색합니다. 법령명 또는 본문 내용으로 검색할 수 있으며, 페이지네이션과 정렬을 지원합니다.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "검색할 법령명 또는 내용" },
            type: { type: "string", enum: ["law", "ordinance"], description: "검색 유형: law=법령(기본값), ordinance=자치법규(조례)", default: "law" },
            page: { type: "number", description: "페이지 번호", default: 1 },
            display: { type: "number", description: "페이지당 결과 수 (최대 100)", default: 20 },
            search: { type: "number", description: "검색 범위: 1=법령명(기본값), 2=본문검색", default: 1 },
            sort: { 
              type: "string", 
              enum: ["lasc", "ldes", "dasc", "ddes", "nasc", "ndes", "efasc", "efdes"],
              description: "정렬: lasc=법령명 오름차순, ldes=법령명 내림차순, dasc=공포일자 오름차순, ddes=공포일자 내림차순, nasc=공포번호 오름차순, ndes=공포번호 내림차순, efasc=시행일자 오름차순, efdes=시행일자 내림차순",
              default: "lasc"
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_law_details",
        description: "특정 법령 또는 자치법규의 상세 정보를 파일로 저장합니다. lawId 또는 mst 중 하나를 제공해야 합니다.",
        inputSchema: {
          type: "object",
          properties: {
            lawId: { type: "string", description: "법령/자치법규 ID (예: '001638' - 도로교통법, '2026666' - 자치법규)" },
            mst: { type: "string", description: "법령/자치법규 일련번호 (예: '266639' - 법령, '1316146' - 자치법규)" },
            type: { type: "string", enum: ["law", "ordinance"], description: "조회 유형: law=법령(기본값), ordinance=자치법규(조례)", default: "law" },
          },
          required: [],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "search_laws": {
      const validated = SearchLawSchema.parse(args);
      return searchLaws(validated);
    }
    
    case "get_law_details": {
      const validated = GetLawDetailsSchema.parse(args);
      return getLawDetails(validated);
    }
    
    default:
      throw new Error(`알 수 없는 도구: ${name}`);
  }
});

// API client functions
async function searchLaws(params: z.infer<typeof SearchLawSchema>) {
  try {
    const url = new URL(`${API_BASE_URL}/lawSearch.do`);
    url.searchParams.set("OC", DEFAULT_OC);
    url.searchParams.set("target", params.type === "ordinance" ? "ordin" : "law");
    url.searchParams.set("type", "JSON");
    url.searchParams.set("query", params.query);
    url.searchParams.set("page", params.page.toString());
    url.searchParams.set("display", params.display.toString());
    url.searchParams.set("search", params.search.toString());
    url.searchParams.set("sort", params.sort);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get("content-type");
    let result;
    
    if (contentType?.includes("application/json")) {
      result = await response.json();
    } else {
      // Parse XML or other formats as text
      const text = await response.text();
      result = text;
    }
    
    // Format the response for better readability
    if (typeof result === 'object' && result !== null) {
      // Handle regular law search results
      const lawSearch = result.LawSearch;
      if (lawSearch) {
        const laws = Array.isArray(lawSearch.law) ? lawSearch.law : [lawSearch.law].filter(Boolean);
        const summary = {
          totalCount: lawSearch.totalCnt || laws.length,
          page: lawSearch.page || 1,
          results: laws.map((law: any) => ({
            lawName: law.법령명한글,
            lawId: law.법령ID,
            mst: law.법령일련번호,
            type: law.법령구분명,
            ministry: law.소관부처명,
            promulgationDate: law.공포일자,
            promulgationNumber: law.공포번호,
            enforcementDate: law.시행일자,
            status: law.현행연혁코드,
            detailLink: law.법령상세링크
          }))
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }
      
      // Handle ordinance search results
      const ordinSearch = result.OrdinSearch;
      if (ordinSearch) {
        const laws = Array.isArray(ordinSearch.law) ? ordinSearch.law : [ordinSearch.law].filter(Boolean);
        const summary = {
          totalCount: ordinSearch.totalCnt || laws.length,
          page: ordinSearch.page || 1,
          searchType: "ordinance",
          results: laws.map((law: any) => ({
            lawName: law.자치법규명,
            lawId: law.자치법규ID,
            mst: law.자치법규일련번호,
            type: law.자치법규종류,
            localGov: law.지자체기관명,
            promulgationDate: law.공포일자,
            promulgationNumber: law.공포번호,
            enforcementDate: law.시행일자,
            revisionType: law.제개정구분명,
            detailLink: law.자치법규상세링크
          }))
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }
      
      // If not a search result, return as-is
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `법령 검색 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        },
      ],
      isError: true,
    };
  }
}

async function getLawDetails(params: z.infer<typeof GetLawDetailsSchema>) {
  try {
    const url = new URL(`${API_BASE_URL}/lawService.do`);
    url.searchParams.set("OC", DEFAULT_OC);
    url.searchParams.set("target", params.type === "ordinance" ? "ordin" : "law");
    url.searchParams.set("type", "JSON"); // Always use JSON for best parsing
    
    if (params.lawId) {
      url.searchParams.set("ID", params.lawId);
    } else if (params.mst) {
      url.searchParams.set("MST", params.mst);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get("content-type");
    let result;
    
    if (contentType?.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      try {
        result = JSON.parse(text);
      } catch {
        result = text;
      }
    }
    
    // Format the law details response
    if (typeof result === 'object' && result !== null && result.법령) {
      const law = result.법령;
      const basicInfo = law.기본정보;
      
      const summary = {
        법령키: law.법령키,
        기본정보: {
          법령명_한글: basicInfo.법령명_한글,
          법령ID: basicInfo.법령ID,
          법종구분: basicInfo.법종구분?.content || basicInfo.법종구분,
          소관부처: basicInfo.소관부처?.content || basicInfo.소관부처,
          공포일자: basicInfo.공포일자,
          공포번호: basicInfo.공포번호,
          시행일자: basicInfo.시행일자,
          제개정구분: basicInfo.제개정구분,
          전화번호: basicInfo.전화번호,
        },
        조문: law.조문 ? (Array.isArray(law.조문.조문단위) ? law.조문.조문단위 : [law.조문.조문단위]) : [],
        부칙: law.부칙 ? (Array.isArray(law.부칙.부칙단위) ? law.부칙.부칙단위 : [law.부칙.부칙단위]) : [],
        별표: law.별표 ? (Array.isArray(law.별표.별표단위) ? law.별표.별표단위 : [law.별표.별표단위]) : [],
        개정문: law.개정문 ? law.개정문.개정문내용 : null,
        제개정이유: law.제개정이유 ? law.제개정이유.제개정이유내용 : null,
      };
      
      // Create filename from law name, removing invalid characters
      const lawName = basicInfo.법령명_한글 || "법령";
      const safeFilename = lawName.replace(/[<>:"/\\|?*]/g, "_");
      const jsonFilename = safeFilename + ".json";
      const mdFilename = safeFilename + ".md";
      
      // Save JSON file
      await Deno.writeTextFile(jsonFilename, JSON.stringify(summary, null, 2));
      
      // Create Markdown content
      let mdContent = `# ${lawName}\n\n`;
      
      // Add articles
      if (summary.조문 && summary.조문.length > 0) {
        mdContent += "## 조문\n\n";
        for (const article of summary.조문) {
          // Check if this is a chapter/section heading (전문)
          if (article.조문여부 === "전문") {
            mdContent += `\n### ${article.조문내용}\n\n`;
            continue;
          }
          
          // Add main article content directly
          mdContent += article.조문내용 || "";
          
          // Add reference material
          if (article.조문참고자료) {
            mdContent += ` ${article.조문참고자료}`;
          }
          mdContent += "\n";
          
          // Add paragraphs (항)
          if (article.항) {
            const paragraphs = Array.isArray(article.항) ? article.항 : [article.항];
            for (const para of paragraphs) {
              // Use 항내용 directly as it already contains proper formatting
              if (para.항내용) {
                mdContent += `\n${para.항내용}\n`;
              }
              
              // Add subparagraphs (호)
              if (para.호) {
                const subparas = Array.isArray(para.호) ? para.호 : [para.호];
                for (const subpara of subparas) {
                  if (subpara.호내용) {
                    mdContent += `${subpara.호내용}\n`;
                  }
                }
              }
            }
          }
          
          // Add annotations
          if (article.조문주석) {
            if (typeof article.조문주석 === 'string') {
              mdContent += `\n${article.조문주석}`;
            } else if (article.조문주석.시행일) {
              mdContent += `\n[시행일 : ${article.조문주석.시행일}]`;
            }
          }
          
          // Add change history
          if (article.조문변경이력) {
            const history = Array.isArray(article.조문변경이력) ? article.조문변경이력 : [article.조문변경이력];
            for (const change of history) {
              if (change.법령명 && change.순번) {
                mdContent += ` <${change.법령명}>`;
              }
            }
          }
          mdContent += "\n\n";
        }
      }
      
      // Add supplements
      if (summary.부칙 && summary.부칙.length > 0) {
        mdContent += "## 부칙\n\n";
        for (const supplement of summary.부칙) {
          
          // Handle 부칙내용 - could be string or array
          if (supplement.부칙내용) {
            if (Array.isArray(supplement.부칙내용)) {
              mdContent += supplement.부칙내용.join('\n');
            } else {
              mdContent += supplement.부칙내용;
            }
          }
          
          if (supplement.부칙주석) {
            mdContent += ` ${supplement.부칙주석}`;
          }
          mdContent += "\n\n";
        }
      }
      
      // Add attached tables if exists
      if (summary.별표 && summary.별표.length > 0) {
        mdContent += "## 별표\n\n";
        for (const table of summary.별표) {
          // Add table title
          if (table.별표제목) {
            mdContent += `### [별표 ${table.별표번호}] ${table.별표제목}\n\n`;
          }
          
          // Add table content
          if (table.별표내용) {
            if (Array.isArray(table.별표내용)) {
              // Handle nested arrays - each inner array is a table section
              const formattedTable = table.별표내용.map((section: any) => {
                if (Array.isArray(section)) {
                  return section.join('\n');
                }
                return section;
              }).join('\n\n');
              mdContent += formattedTable;
            } else {
              mdContent += table.별표내용;
            }
          }
          
          mdContent += "\n\n";
        }
      }
      
      // Add amendments if exists
      if (summary.개정문) {
        mdContent += "## 개정문\n\n";
        if (Array.isArray(summary.개정문)) {
          // Handle nested arrays - join inner arrays with newlines, outer with double newlines
          const formattedAmendments = summary.개정문.map(amendment => {
            if (Array.isArray(amendment)) {
              return amendment.join('\n');
            }
            return amendment;
          }).join('\n\n');
          mdContent += formattedAmendments;
        } else {
          mdContent += summary.개정문;
        }
        mdContent += "\n\n";
      }
      
      // Add amendment reasons if exists
      if (summary.제개정이유) {
        mdContent += "## 제·개정이유\n\n";
        if (Array.isArray(summary.제개정이유)) {
          // Handle nested arrays - join inner arrays with newlines, outer with double newlines
          const formattedReasons = summary.제개정이유.map(reason => {
            if (Array.isArray(reason)) {
              return reason.join('\n');
            }
            return reason;
          }).join('\n\n');
          mdContent += formattedReasons;
        } else {
          mdContent += summary.제개정이유;
        }
        mdContent += "\n\n";
      }
      
      // Save Markdown file
      await Deno.writeTextFile(mdFilename, mdContent);
      
      return {
        content: [
          {
            type: "text",
            text: `법령 상세 정보를 파일로 저장했습니다:\n- JSON: ${jsonFilename}\n- Markdown: ${mdFilename}\n\n법령명: ${lawName}\n법령ID: ${basicInfo.법령ID}\n소관부처: ${basicInfo.소관부처?.content || basicInfo.소관부처}\n시행일자: ${basicInfo.시행일자}`,
          },
        ],
      };
    }
    
    // Handle ordinance details response
    if (typeof result === 'object' && result !== null && result.LawService) {
      const service = result.LawService;
      const basicInfo = service.자치법규기본정보;
      
      if (basicInfo) {
        const summary = {
          자치법규키: basicInfo.자치법규일련번호,
          기본정보: {
            법령명_한글: basicInfo.자치법규명,
            법령ID: basicInfo.자치법규ID,
            법종구분: basicInfo.자치법규종류,
            소관부처: basicInfo.지자체기관명,
            공포일자: basicInfo.공포일자,
            공포번호: basicInfo.공포번호,
            시행일자: basicInfo.시행일자,
            제개정구분: basicInfo.제개정정보,
            전화번호: basicInfo.전화번호,
            담당부서: basicInfo.담당부서명,
          },
          조문: service.조문 && service.조문.조 ? (Array.isArray(service.조문.조) ? service.조문.조 : [service.조문.조]) : [],
          부칙: service.부칙 ? [service.부칙] : [],
        };
        
        // Create filename from ordinance name, removing invalid characters
        const lawName = basicInfo.자치법규명 || "자치법규";
        const safeFilename = lawName.replace(/[<>:"/\\|?*]/g, "_");
        const jsonFilename = safeFilename + ".json";
        const mdFilename = safeFilename + ".md";
        
        // Save JSON file
        await Deno.writeTextFile(jsonFilename, JSON.stringify(summary, null, 2));
        
        // Create Markdown content
        let mdContent = `# ${lawName}\n\n`;
        
        // Add articles
        if (summary.조문 && summary.조문.length > 0) {
          mdContent += "## 조문\n\n";
          for (const article of summary.조문) {
            // Check if this is an article or section heading
            if (article.조문여부 === "N") {
              mdContent += `\n### ${article.조내용}\n\n`;
              continue;
            }
            
            // Add main article content
            mdContent += article.조내용 || "";
            mdContent += "\n\n";
          }
        }
        
        // Add supplements
        if (summary.부칙 && summary.부칙.length > 0) {
          mdContent += "## 부칙\n\n";
          for (const supplement of summary.부칙) {
            if (supplement.부칙내용) {
              mdContent += supplement.부칙내용;
            }
            mdContent += "\n\n";
          }
        }
        
        // Save Markdown file
        await Deno.writeTextFile(mdFilename, mdContent);
        
        return {
          content: [
            {
              type: "text",
              text: `자치법규 상세 정보를 파일로 저장했습니다:\n- JSON: ${jsonFilename}\n- Markdown: ${mdFilename}\n\n자치법규명: ${lawName}\n자치법규ID: ${basicInfo.자치법규ID}\n지자체: ${basicInfo.지자체기관명}\n시행일자: ${basicInfo.시행일자}`,
            },
          ],
        };
      }
    }
    
    // If result is not in expected format, save raw result
    const filename = params.type === "ordinance" ? "자치법규_상세.json" : "법령_상세.json";
    await Deno.writeTextFile(filename, typeof result === "string" ? result : JSON.stringify(result, null, 2));
    
    return {
      content: [
        {
          type: "text",
          text: `법령 상세 정보를 파일로 저장했습니다: ${filename}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `법령 상세 조회 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        },
      ],
      isError: true,
    };
  }
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Korean Law MCP Server running on stdio");
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Server error:", error);
    Deno.exit(1);
  });
}

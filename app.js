/**
 * 0. Supabase 실시간 공유 DB 설정
 * 모든 컴퓨터에서 별도 설정 없이 바로 동기화하려면 아래 url, anonKey를 입력한 뒤 GitHub에 배포하세요.
 * 또는 웹 화면 상단 [DB 설정] 버튼에서 직접 입력해 연결/테스트할 수 있습니다.
 */
const SUPABASE_CONFIG_STORAGE_KEY = 'smart_factory_supabase_config_v1';
const DEFAULT_SUPABASE_CONFIG = {
    url: 'https://lrpmdelrvebjzuqaskni.supabase.co',
    anonKey: 'sb_publishable_CsNJc1ZebGGAABq7YUL_jA_T3rm6_8K',
    autoSync: true,
    legacyTable: 'factory_inventory_state',
    legacyRowId: 'main'
};

/**
 * 1. 실제 공장 도면(Fac C, Fac A, Fac B / Ground(1F) & Mezzanine(2F)) 기반 데이터 모델
 * 명명 규칙: [팩토리구역]-[층수(1F/2F)]-[랙번호] (예: C-1F-A1)
 * tiers 속성이 있는 랙은 3D 상에서 실제 층수(예: 5단)대로 입체 분리되어 렌더링됩니다.
 * localStorage + Supabase 연동을 통해 새로고침 및 다른 컴퓨터에서도 배치/재고 변경사항이 동기화됩니다.
 */
const STORAGE_KEY = 'smart_factory_3d_inventory_v1';
/* __BAKED_DATA_START__ */
const DEFAULT_DATA_REVISION = 1;
const DEFAULT_FACTORY_BLOCKS_DATA = [
    // ================= [FAC C - 1F (좌측 동 1층)] =================
    {
        id: "C-1F-A1",
        fac: "Fac C",
        floor: "GROUND",
        codeLabel: "C-1F-A1",
        name: "C-1F-A1 (메인 5단 프로파일 랙)",
        desc: "Fac C 구역 • 1F 층 • A1 랙 (총 5단 분리 적재 구조)",
        pos: { x: -24.5, y: 0, z: 4 },
        size: { w: 1.8, h: 3.5, d: 12 },
        status: "normal",
        defaultHighlight: true,
        tiers: 5, // 5단 분리 랙
        profiles: [
            // 1단 (하단 중량 프로파일)
            { tier: 1, code: "A-EXT-WA-00-01", name: "고강도 메인 프레임 프로파일 (특수)", spec: "50x100mm / L=6000mm / 슬롯 10mm", qty: 180, minQty: 50, layer: "1단 (하단)", material: "A6063-T6" },
            { tier: 1, code: "AL-8080-BASE", name: "베이스 전용 중량 프로파일 80x80", spec: "80x80mm / L=6000mm / 두께 3.2T", qty: 95, minQty: 30, layer: "1단 (하단)", material: "A6063-T6" },
            // 2단
            { tier: 2, code: "AL-4080-H", name: "고강도 직사각 프로파일 40x80", spec: "40x80mm / L=6000mm / 슬롯 8mm", qty: 210, minQty: 60, layer: "2단", material: "A6063-T6" },
            { tier: 2, code: "AL-4040-H", name: "고강도 표준 프로파일 40x40", spec: "40x40mm / L=6000mm / 두께 2.5T", qty: 320, minQty: 100, layer: "2단", material: "A6063-T6" },
            // 3단
            { tier: 3, code: "AL-4040-EXT", name: "외장 마감용 알루미늄 프로파일 40x40", spec: "40x40mm / L=6000mm / 아노다이징", qty: 240, minQty: 80, layer: "3단 (중단)", material: "A6063-T5" },
            { tier: 3, code: "AL-4545-S", name: "표준 프로파일 45x45 (슬롯 10mm)", spec: "45x45mm / L=6000mm", qty: 150, minQty: 50, layer: "3단 (중단)", material: "A6063-T5" },
            // 4단
            { tier: 4, code: "AL-3060-S", name: "중형 직사각 프로파일 30x60", spec: "30x60mm / L=4000mm / 슬롯 8mm", qty: 190, minQty: 60, layer: "4단", material: "A6063-T5" },
            // 5단 (상단 경량 프로파일)
            { tier: 5, code: "AL-3030-L", name: "경량 슬림 프로파일 30x30", spec: "30x30mm / L=4000mm / 두께 1.8T", qty: 410, minQty: 120, layer: "5단 (상단)", material: "A6063-T5" },
            { tier: 5, code: "AL-2040-L", name: "경량 커버용 프로파일 20x40", spec: "20x40mm / L=3000mm / 슬롯 6mm", qty: 280, minQty: 80, layer: "5단 (상단)", material: "A6063-T5" }
        ]
    },
    {
        id: "C-1F-B1",
        fac: "Fac C",
        floor: "GROUND",
        codeLabel: "C-1F-B1",
        name: "C-1F-B1 (표준 4단 프로파일 랙)",
        desc: "Fac C 구역 • 1F 층 • B1 랙 (총 4단 분리 적재)",
        pos: { x: -21.5, y: 0, z: 2.5 },
        size: { w: 1.6, h: 2.8, d: 9 },
        status: "normal",
        tiers: 4,
        profiles: [
            { tier: 1, code: "AL-3030-S", name: "표준 알루미늄 프로파일 30x30", spec: "30x30mm / L=4000mm / 슬롯 8mm", qty: 310, minQty: 100, layer: "1단", material: "A6063-T5" },
            { tier: 2, code: "AL-3030-B", name: "블랙 아노다이징 30x30", spec: "30x30mm / L=4000mm", qty: 185, minQty: 50, layer: "2단", material: "A6063-T5" },
            { tier: 3, code: "AL-3060-L", name: "경량 프로파일 30x60", spec: "30x60mm / L=4000mm", qty: 140, minQty: 40, layer: "3단", material: "A6063-T5" },
            { tier: 4, code: "AL-2020-H", name: "소형 보강 프로파일 20x20", spec: "20x20mm / L=3000mm", qty: 390, minQty: 100, layer: "4단", material: "A6063-T5" }
        ]
    },
    {
        id: "C-1F-C1",
        fac: "Fac C",
        floor: "GROUND",
        codeLabel: "C-1F-C1",
        name: "C-1F-C1 (중형 4단 프로파일 랙)",
        desc: "Fac C 구역 • 1F 층 • C1 랙 (총 4단 분리 적재)",
        pos: { x: -18.8, y: 0, z: 2.5 },
        size: { w: 1.6, h: 2.8, d: 9 },
        status: "warning",
        tiers: 4,
        profiles: [
            { tier: 1, code: "AL-3060-S", name: "직사각 프로파일 30x60", spec: "30x60mm / L=4000mm / 슬롯 8mm", qty: 24, minQty: 50, layer: "1단", material: "A6063-T5" },
            { tier: 2, code: "AL-4040-S", name: "표준 프로파일 40x40", spec: "40x40mm / L=4000mm", qty: 120, minQty: 40, layer: "2단", material: "A6063-T5" },
            { tier: 3, code: "AL-4040-R", name: "라운드 엣지 프로파일 40x40R", spec: "40x40mm / R40 곡면", qty: 65, minQty: 20, layer: "3단", material: "A6063-T5" },
            { tier: 4, code: "AL-2040-S", name: "소형 직사각 프로파일 20x40", spec: "20x40mm / L=3000mm", qty: 210, minQty: 60, layer: "4단", material: "A6063-T5" }
        ]
    },
    {
        id: "C-1F-D1",
        fac: "Fac C",
        floor: "GROUND",
        codeLabel: "C-1F-D1",
        name: "C-1F-D1 (경량 3단 프로파일 랙)",
        desc: "Fac C 구역 • 1F 층 • D1 랙 (총 3단 분리 적재)",
        pos: { x: -16.3, y: 0, z: 3.5 },
        size: { w: 1.4, h: 2.1, d: 7 },
        status: "normal",
        tiers: 3,
        profiles: [
            { tier: 1, code: "AL-2020-S", name: "경량 프로파일 20x20", spec: "20x20mm / L=3000mm / 슬롯 6mm", qty: 420, minQty: 120, layer: "1단", material: "A6063-T5" },
            { tier: 2, code: "AL-1515-S", name: "초경량 프로파일 15x15", spec: "15x15mm / L=2000mm", qty: 350, minQty: 100, layer: "2단", material: "A6063-T5" },
            { tier: 3, code: "AL-COVER-20", name: "20시리즈 마감 바", spec: "20mm 전용 / L=3000mm", qty: 500, minQty: 150, layer: "3단", material: "A6063-T5" }
        ]
    },
    // Fac C 전면 야드(Yard) 구역 W, X, Y
    {
        id: "C-1F-W1",
        fac: "Fac C",
        floor: "GROUND",
        codeLabel: "C-1F-W1",
        name: "C-1F-W1 (전면 야드 W 구역)",
        desc: "Fac C 구역 • 1F 층 • W1 야드 적재대",
        pos: { x: -25.8, y: 0, z: 14.5 },
        size: { w: 1.8, h: 1.5, d: 7.5 },
        status: "normal",
        profiles: [
            { code: "AL-6060-RAW", name: "압출 원소재 프로파일 60x60 (미가공)", spec: "60x60mm / L=6500mm", qty: 95, minQty: 30, layer: "야드 팔레트", material: "A6063-T5" }
        ]
    },
    {
        id: "C-1F-X1",
        fac: "Fac C",
        floor: "GROUND",
        codeLabel: "C-1F-X1",
        name: "C-1F-X1 (전면 야드 X 구역)",
        desc: "Fac C 구역 • 1F 층 • X1 대형 출하 대기 블록",
        pos: { x: -18.5, y: 0, z: 13.5 },
        size: { w: 9.5, h: 1.6, d: 3.2 },
        status: "normal",
        profiles: [
            { code: "PKG-4040-SET", name: "출하 포장 번들 (40x40 20본입)", spec: "40x40mm / L=6000mm / 번들단위", qty: 48, minQty: 15, layer: "지상 적재", material: "A6063-T5" }
        ]
    },
    {
        id: "C-1F-Y1",
        fac: "Fac C",
        floor: "GROUND",
        codeLabel: "C-1F-Y1",
        name: "C-1F-Y1 (전면 야드 Y 구역)",
        desc: "Fac C 구역 • 1F 층 • Y1 통로 인접 적재 블록",
        pos: { x: -11.5, y: 0, z: 14.5 },
        size: { w: 1.8, h: 1.5, d: 7.5 },
        status: "normal",
        profiles: [
            { code: "AL-4080-S", name: "중량 프레임 프로파일 40x80", spec: "40x80mm / L=6000mm", qty: 76, minQty: 25, layer: "야드 랙", material: "A6063-T6" }
        ]
    },

    // ================= [FAC A - 1F (중앙 동 1층)] =================
    {
        id: "A-1F-A1",
        fac: "Fac A",
        floor: "GROUND",
        codeLabel: "A-1F-A1",
        name: "A-1F-A1 (좌측실 4단 복합 랙)",
        desc: "Fac A 구역 • 1F 층 • A1 랙 (총 4단 분리 적재)",
        pos: { x: -4.5, y: 0, z: 4 },
        size: { w: 5.5, h: 2.8, d: 10 },
        status: "normal",
        tiers: 4,
        profiles: [
            { tier: 1, code: "AL-4040-H", name: "고강도 프로파일 40x40 (중량형)", spec: "40x40mm / L=6000mm / 두께 2.5T", qty: 510, minQty: 150, layer: "1단", material: "A6063-T6" },
            { tier: 2, code: "AL-4545-S", name: "표준 프로파일 45x45", spec: "45x45mm / L=6000mm / 슬롯 10mm", qty: 290, minQty: 100, layer: "2단", material: "A6063-T5" },
            { tier: 3, code: "AL-4590-H", name: "직사각 고강도 프로파일 45x90", spec: "45x90mm / L=6000mm", qty: 130, minQty: 40, layer: "3단", material: "A6063-T6" },
            { tier: 4, code: "AL-4040-L", name: "경량 프로파일 40x40", spec: "40x40mm / L=6000mm / 두께 1.8T", qty: 440, minQty: 120, layer: "4단", material: "A6063-T5" }
        ]
    },
    {
        id: "A-1F-A2",
        fac: "Fac A",
        floor: "GROUND",
        codeLabel: "A-1F-A2",
        name: "A-1F-A2 (우측실 4단 장척 랙)",
        desc: "Fac A 구역 • 1F 층 • A2 랙 (6m 장척 전용 4단 랙)",
        pos: { x: 3.5, y: 0, z: 3.5 },
        size: { w: 4.5, h: 2.8, d: 10 },
        status: "warning",
        tiers: 4,
        profiles: [
            { tier: 1, code: "AL-8080-H", name: "초고강도 메인 프로파일 80x80", spec: "80x80mm / L=6000mm / 두께 3.5T", qty: 19, minQty: 35, layer: "1단", material: "A6061-T6" },
            { tier: 2, code: "AL-40120-H", name: "고하중 빔 프로파일 40x120", spec: "40x120mm / L=6000mm", qty: 42, minQty: 20, layer: "2단", material: "A6061-T6" },
            { tier: 3, code: "AL-6060-H", name: "중량 컬럼 프로파일 60x60", spec: "60x60mm / L=6000mm", qty: 85, minQty: 30, layer: "3단", material: "A6063-T6" },
            { tier: 4, code: "AL-4080-L", name: "경량 빔 프로파일 40x80", spec: "40x80mm / L=6000mm", qty: 110, minQty: 30, layer: "4단", material: "A6063-T5" }
        ]
    },
    // Fac A 전면 야드 W, X, Y
    {
        id: "A-1F-W1",
        fac: "Fac A",
        floor: "GROUND",
        codeLabel: "A-1F-W1",
        name: "A-1F-W1 (전면 야드 W 구역)",
        desc: "Fac A 구역 • 1F 층 • W1 진입로 적재대",
        pos: { x: -8.8, y: 0, z: 14.5 },
        size: { w: 1.8, h: 1.5, d: 7.5 },
        status: "normal",
        profiles: [
            { code: "AL-3030-B", name: "블랙 아노다이징 프로파일 30x30", spec: "30x30mm / L=4000mm", qty: 130, minQty: 40, layer: "야드 W", material: "A6063-T5" }
        ]
    },
    {
        id: "A-1F-X1",
        fac: "Fac A",
        floor: "GROUND",
        codeLabel: "A-1F-X1",
        name: "A-1F-X1 (중앙 메인 적재대 X)",
        desc: "Fac A 구역 • 1F 층 • X1 대용량 출고 블록",
        pos: { x: -1.0, y: 0, z: 13.5 },
        size: { w: 9.5, h: 1.7, d: 3.5 },
        status: "normal",
        profiles: [
            { code: "AL-4040-S", name: "표준 알루미늄 프로파일 40x40", spec: "40x40mm / L=6000mm / 슬롯 8mm", qty: 680, minQty: 200, layer: "중앙 X 블록", material: "A6063-T5" }
        ]
    },
    {
        id: "A-1F-Y1",
        fac: "Fac A",
        floor: "GROUND",
        codeLabel: "A-1F-Y1",
        name: "A-1F-Y1 (전면 하단 적재대 Y)",
        desc: "Fac A 구역 • 1F 층 • Y1 절단 가공품 보관대",
        pos: { x: -1.5, y: 0, z: 17.2 },
        size: { w: 8.8, h: 1.3, d: 1.8 },
        status: "normal",
        profiles: [
            { code: "CUT-4040-1500", name: "정밀 절단품 40x40 (L=1500mm)", spec: "40x40mm / 양단 탭가공 완료", qty: 215, minQty: 50, layer: "Y 라인", material: "A6063-T5" }
        ]
    },

    // ================= [FAC B - 1F (우측 동 1층)] =================
    {
        id: "B-1F-B1",
        fac: "Fac B",
        floor: "GROUND",
        codeLabel: "B-1F-B1",
        name: "B-1F-B1 (초대형 겐트리 3단 랙)",
        desc: "Fac B 구역 • 1F 층 • B1 랙 (총 3단 고하중 랙)",
        pos: { x: 18.5, y: 0, z: 3.5 },
        size: { w: 8.5, h: 2.7, d: 10 },
        status: "normal",
        tiers: 3,
        profiles: [
            { tier: 1, code: "AL-100100-H", name: "초중량 컬럼 프로파일 100x100", spec: "100x100mm / L=6000mm", qty: 32, minQty: 10, layer: "1단 (초중량)", material: "A6061-T6" },
            { tier: 2, code: "AL-80160-H", name: "겐트리 메인 빔 프로파일 80x160", spec: "80x160mm / L=6000mm / 두께 4.0T", qty: 54, minQty: 20, layer: "2단 (중단)", material: "A6061-T6" },
            { tier: 3, code: "AL-8080-L", name: "표준 구조용 프로파일 80x80", spec: "80x80mm / L=6000mm", qty: 75, minQty: 25, layer: "3단 (상단)", material: "A6063-T6" }
        ]
    },
    // Fac B 전면 야드 W, S/X, Y, Z
    {
        id: "B-1F-W1",
        fac: "Fac B",
        floor: "GROUND",
        codeLabel: "B-1F-W1",
        name: "B-1F-W1 (전면 상단 적재대 W)",
        desc: "Fac B 구역 • 1F 층 • W1 상하차 대기 블록",
        pos: { x: 16.5, y: 0, z: 13.0 },
        size: { w: 9.0, h: 1.6, d: 3.0 },
        status: "normal",
        profiles: [
            { code: "AL-60120-H", name: "중량 프레임 프로파일 60x120", spec: "60x120mm / L=6000mm", qty: 88, minQty: 30, layer: "W 블록", material: "A6063-T6" }
        ]
    },
    {
        id: "B-1F-X1",
        fac: "Fac B",
        floor: "GROUND",
        codeLabel: "B-1F-X1",
        name: "B-1F-X1 (전면 중단 적재대 S & X)",
        desc: "Fac B 구역 • 1F 층 • X1 특수/표준 번들 라인",
        pos: { x: 17.5, y: 0, z: 15.8 },
        size: { w: 8.8, h: 1.3, d: 1.6 },
        status: "warning",
        profiles: [
            { code: "AL-CONV-80", name: "컨베이어 가이드 특수 프로파일", spec: "80x30mm / L=4000mm / 내마모", qty: 14, minQty: 30, layer: "S/X 라인", material: "A6063-T5" }
        ]
    },
    {
        id: "B-1F-Y1",
        fac: "Fac B",
        floor: "GROUND",
        codeLabel: "B-1F-Y1",
        name: "B-1F-Y1 (전면 하단 적재대 Y & Z)",
        desc: "Fac B 구역 • 1F 층 • Y1 수출/체결키트 적재대",
        pos: { x: 18.2, y: 0, z: 17.8 },
        size: { w: 10.2, h: 1.4, d: 1.8 },
        status: "normal",
        profiles: [
            { code: "AL-4040-EXPORT", name: "수출용 포장 프로파일 40x40", spec: "40x40mm / L=6000mm / 방습포장", qty: 340, minQty: 100, layer: "Y 구역", material: "A6063-T5" },
            { code: "ACC-JOINT-KIT", name: "대형 프로파일 전용 체결 키트", spec: "80/100시리즈 브라켓+볼트 세트", qty: 620, minQty: 200, layer: "Z 박스", material: "S45C" }
        ]
    },

    // ================= [MEZZANINE - 2F (2층 중층 구조 전체)] =================
    {
        id: "C-2F-A1",
        fac: "Fac C",
        floor: "MEZZANINE",
        codeLabel: "C-2F-A1",
        name: "C-2F-A1 (2층 경량 4단 프로파일실)",
        desc: "Fac C 구역 • 2F(중층) • A1 랙 (총 4단 분리 적재)",
        pos: { x: -20.5, y: 6.5, z: 3.5 },
        size: { w: 5.5, h: 2.4, d: 10 },
        status: "normal",
        tiers: 4,
        profiles: [
            { tier: 1, code: "AL-2020-B", name: "블랙 미니 프로파일 20x20", spec: "20x20mm / L=3000mm", qty: 320, minQty: 100, layer: "1단", material: "A6063-T5" },
            { tier: 2, code: "AL-2020-S", name: "실버 미니 프로파일 20x20", spec: "20x20mm / L=3000mm", qty: 450, minQty: 120, layer: "2단", material: "A6063-T5" },
            { tier: 3, code: "AL-1515-S", name: "초경량 미니 프로파일 15x15", spec: "15x15mm / L=2000mm / 슬롯 5mm", qty: 540, minQty: 150, layer: "3단", material: "A6063-T5" },
            { tier: 4, code: "AL-1530-S", name: "초경량 직사각 프로파일 15x30", spec: "15x30mm / L=2000mm", qty: 260, minQty: 80, layer: "4단", material: "A6063-T5" }
        ]
    },
    {
        id: "A-2F-A1",
        fac: "Fac A",
        floor: "MEZZANINE",
        codeLabel: "A-2F-A1",
        name: "A-2F-A1 (2층 부자재/브라켓실)",
        desc: "Fac A 구역 • 2F(중층) • A1 체결 부품 보관 랙",
        pos: { x: -1.5, y: 6.5, z: 3.5 },
        size: { w: 12.0, h: 1.5, d: 10 },
        status: "normal",
        profiles: [
            { code: "ACC-BRK-40", name: "다이캐스팅 코너 브라켓 4040", spec: "알루미늄 주조 / 40시리즈 전용", qty: 2450, minQty: 800, layer: "2층 A존", material: "ADC12" },
            { code: "ACC-TNUT-M8", name: "스프링 T-너트 M8 (슬롯 8mm)", spec: "스틸 니켈도금 / 100개입 박스", qty: 4800, minQty: 1500, layer: "2층 B존", material: "S45C" }
        ]
    },
    {
        id: "B-2F-A1",
        fac: "Fac B",
        floor: "MEZZANINE",
        codeLabel: "B-2F-A1",
        name: "B-2F-A1 (2층 클린룸 특수 3단 랙)",
        desc: "Fac B 구역 • 2F(중층) • A1 랙 (총 3단 분리 적재)",
        pos: { x: 18.5, y: 6.5, z: 3.5 },
        size: { w: 8.5, h: 2.2, d: 10 },
        status: "warning",
        tiers: 3,
        profiles: [
            { tier: 1, code: "AL-4040-FLAT", name: "클린룸 밀폐형 프로파일 40x40", spec: "40x40mm / L=4000mm / 무슬롯", qty: 18, minQty: 40, layer: "1단", material: "A6063-T5" },
            { tier: 2, code: "AL-4080-FLAT", name: "클린룸 밀폐형 프로파일 40x80", spec: "40x80mm / L=4000mm / 무슬롯", qty: 45, minQty: 20, layer: "2단", material: "A6063-T5" },
            { tier: 3, code: "AL-COVER-PVC", name: "슬롯 마감용 PVC 커버 (그레이)", spec: "슬롯 8mm 전용 / L=2000mm", qty: 850, minQty: 300, layer: "3단", material: "PVC" }
        ]
    }
];
/* __BAKED_DATA_END__ */

function normalizeBlocksArray(arr) {
    arr.forEach(b => {
        if (!b.tiers) b.tiers = 1;
        if (!Array.isArray(b.profiles)) b.profiles = [];
        recalculateBlockStatus(b);
    });
    return arr;
}

function canonicalizeBlocksForHash(arr) {
    return (arr || []).map(b => ({
        id: String(b.id || ''),
        fac: String(b.fac || ''),
        floor: String(b.floor || 'GROUND'),
        codeLabel: String(b.codeLabel || b.id || ''),
        name: String(b.name || ''),
        desc: String(b.desc || ''),
        pos: {
            x: Number(b.pos && b.pos.x) || 0,
            y: Number(b.pos && b.pos.y) || 0,
            z: Number(b.pos && b.pos.z) || 0
        },
        size: {
            w: Number(b.size && b.size.w) || 2,
            h: Number(b.size && b.size.h) || 2.5,
            d: Number(b.size && b.size.d) || 8
        },
        tiers: Number(b.tiers) || 1,
        profiles: (Array.isArray(b.profiles) ? b.profiles : []).map(p => ({
            tier: Number(p.tier) || 1,
            code: String(p.code || '').trim(),
            name: String(p.name || '').trim(),
            length: String((p.length !== undefined ? p.length : getProfileLength(p)) || '-'),
            color: String((p.color !== undefined ? p.color : getProfileColor(p)) || '-'),
            qty: Number(p.qty) || 0,
            minQty: Number(p.minQty) || 0,
            layer: String(p.layer || ''),
            material: String(p.material || 'A6063-T5')
        })).sort((a, c) => (a.tier - c.tier) || a.code.localeCompare(c.code))
    }));
}

function computeDataHash(obj) {
    const str = JSON.stringify(canonicalizeBlocksForHash(obj));
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
    }
    return hash.toString(16);
}

let currentSourceHash = null;

// localStorage에서 저장된 데이터 불러오기 (공유 파일의 최신 리비전이면 파일 내장 데이터 우선 적용)
function loadFactoryData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (DEFAULT_DATA_REVISION <= 1) {
                    return normalizeBlocksArray(parsed);
                }
            } else if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
                const storedRev = Number(parsed.revision) || 1;
                currentSourceHash = parsed.sourceHash || null;
                if (storedRev >= DEFAULT_DATA_REVISION) {
                    return normalizeBlocksArray(parsed.blocks);
                }
            }
        }
    } catch (e) {
        console.warn("저장된 레이아웃 데이터를 불러오지 못해 초기 데이터를 사용합니다.", e);
    }
    const cloned = JSON.parse(JSON.stringify(DEFAULT_FACTORY_BLOCKS_DATA));
    return normalizeBlocksArray(cloned);
}

// 배포 환경(HTTP/HTTPS)에서 ./data.json 을 읽어와 변경 감지 및 자동 로드
async function loadInitialDataFromJsonOrStorage() {
    try {
        const res = await fetch(`./data.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const remoteBlocks = Array.isArray(json) ? json : (Array.isArray(json.blocks) ? json.blocks : null);
        if (!remoteBlocks || remoteBlocks.length === 0) return;

        normalizeBlocksArray(remoteBlocks);
        const remoteHash = computeDataHash(remoteBlocks);
        const remoteRev = Number(json.revision) || 1;

        let stored = null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) stored = JSON.parse(raw);
        } catch (_) {}

        const storedSourceHash = stored && !Array.isArray(stored) ? stored.sourceHash : null;
        const storedRev = stored && !Array.isArray(stored) ? (Number(stored.revision) || 1) : 1;
        const isDirty = stored && !Array.isArray(stored) ? Boolean(stored.dirty) : false;

        // data.json이 새로 변경되었거나 로컬 편집 이력이 없으면 data.json을 우선 반영
        if (!stored || !storedSourceHash || remoteHash !== storedSourceHash || remoteRev > storedRev || !isDirty) {
            factoryBlocksData = remoteBlocks;
            currentSourceHash = remoteHash;
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                revision: Math.max(DEFAULT_DATA_REVISION, remoteRev),
                sourceHash: remoteHash,
                dirty: false,
                blocks: factoryBlocksData
            }));
        }
    } catch (err) {
        // file:// 로컬 열기 등 fetch 불가 환경에서는 기존 loadFactoryData() 결과 유지
        console.info("data.json 자동 로드 생략(로컬 파일 또는 오프라인 모드):", err.message);
    }
}

// localStorage에 현재 데이터 즉시 저장 (+ Supabase 자동 동기화 예약)
function saveFactoryData(isUserEdit = true) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            revision: DEFAULT_DATA_REVISION,
            sourceHash: currentSourceHash,
            dirty: isUserEdit,
            blocks: factoryBlocksData
        }));
    } catch (e) {
        console.error("데이터 저장 실패:", e);
    }
    if (typeof updateInventoryNavBadge === 'function') {
        updateInventoryNavBadge();
    }
    if (isUserEdit && !(typeof transformControl !== 'undefined' && transformControl && transformControl.dragging) && typeof scheduleCloudPush === 'function') {
        scheduleCloudPush();
    }
}

// 품목 수량과 안전재고 기준을 비교해 랙 상태(normal / warning) 자동 갱신
function recalculateBlockStatus(blockData) {
    if (!blockData || !Array.isArray(blockData.profiles)) return;
    const hasLowStock = blockData.profiles.some(p => Number(p.qty) <= Number(p.minQty));
    blockData.status = hasLowStock ? "warning" : "normal";
}

let factoryBlocksData = loadFactoryData();

/**
 * 2. Three.js 3D 씬 초기화 및 렌더링 설정
 */
let scene, camera, renderer, controls, transformControl, raycaster, mouse;
let interactiveMeshes = []; // 클릭 가능한 3D 블록/단(Tier) 저장
let blockGroupsMap = {};    // blockId -> THREE.Group 매핑
let floorGroups = { GROUND: null, MEZZANINE: null }; // 층별 그룹 관리
let selectedBlockId = null;
let selectedTier = null; // 선택된 특정 단수 (null이면 전체 단 표시)
let selectedProfileIndex = null; // 선택된 품목 카드 인덱스 (편집/삭제 버튼 표시용)
let isEditMode = false;
let targetCameraPos = null;
let targetControlsLookAt = null;

// 모달 및 페이지/언어 상태 관리용 변수 (기본 언어: 영어)
const LANG_STORAGE_KEY = 'smart_factory_lang_v2';
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) === 'ko' ? 'ko' : 'en';
let currentPage = 'map'; // 'map' | 'inventory'
let invQuickFilter = 'all'; // 'all' | 'multi' | 'low'
let invSortKey = 'name'; // 'code' | 'name' | 'length' | 'color' | 'totalQty'
let invSortDir = 'asc'; // 'asc' | 'desc'
let previewedProfileKey = null;
let previewFocusLocation = null; // { blockId, tier }
let expandedInventoryCodes = new Set();
let rackModalMode = 'add';
let profileModalMode = 'add';
let editingProfileIndex = null;
let modalTargetBlockId = null;
let modalOriginalBlockId = null;
let moveSource = null;
let confirmCallback = null;

const I18N = {
    ko: {
        nav_map: '3D 공장 지도',
        nav_inv: '전체 인벤토리',
        btn_add_rack: '랙 추가',
        btn_full_view: '전체 뷰',
        search_placeholder: '프로파일 코드 검색 (예: AL-4040)',
        edit_on: '배치 편집 ON',
        edit_off: '배치 편집 OFF',
        sub_map: '3D 구역(Rack)을 클릭하여 적재된 프로파일 재고 현황을 확인하세요.',
        sub_inv: '테이블에서 프로파일을 선택하면 우측 3D 지도에서 보관 위치를 바로 확인할 수 있습니다.',
        zone_all: '전체 공장',
        zone_c: 'Fac C (좌측동)',
        zone_a: 'Fac A (중앙동)',
        zone_b: 'Fac B (우측동)',
        floor_all: '전체 층',
        floor_1f: 'Ground (1층)',
        floor_2f: 'Mezzanine (2층)',
        floor_short_all: '전체',
        legend_normal: '일반 구역',
        legend_warning: '부족 주의',
        legend_selected: '선택된 구역',
        guide_click: '클릭/터치: 구역 선택',
        guide_pan: '드래그: 지도 이동',
        guide_zoom: '휠/핀치: 확대/축소',
        editor_title: '랙 위치/크기/단수 조율',
        editor_x: 'X 좌표 (좌/우)',
        editor_z: 'Z 좌표 (앞/뒤)',
        editor_w: '너비 W',
        editor_d: '깊이 D',
        editor_h: '높이 H',
        editor_tiers: '랙 단수(Tier)',
        btn_tier_minus: '- 단',
        btn_tier_plus: '+ 단',
        editor_snap: '0.5m 격자 스냅',
        editor_autosave: '자동 저장됨',
        btn_new_rack: '새 랙 추가',
        btn_del_rack: '선택 랙 삭제',
        btn_copy_json: '좌표 코드 복사',
        btn_edit_rack: '랙 수정',
        panel_select_title: '구역을 선택해주세요',
        panel_select_sub: '3D 지도에서 창고 랙(Rack)을 클릭하면 상세 프로파일 목록이 표시됩니다.',
        tier_manage_title: '랙 단수(층) 관리 및 조회',
        btn_del_tier: '단 삭제',
        btn_add_tier: '단 추가',
        tier_add_item_hint: '선택된 랙/단에 새 프로파일 적재',
        btn_add_item: '품목 추가',
        empty_title: '3D 공장 지도에서 랙(Rack) 선택',
        empty_desc: '원하는 창고 구역을 클릭하면 해당 위치에 보관된<br>알루미늄 프로파일 규격과 재고 수량을 확인할 수 있습니다.',
        summary_items: '총 적재 품목: ',
        summary_qty: '총 재고 수량: ',
        status_normal: '정상 재고',
        status_warning: '재고 부족 주의',
        kpi_types: '총 프로파일 품종',
        kpi_multi: '다중 위치 보관 (2곳+)',
        kpi_qty: '공장 전체 재고 합계',
        kpi_low: '안전재고 미달 위치',
        inv_search_ph: '코드, 품목명, 길이, 색상, 구역 검색...',
        opt_all_fac: '전체 동',
        opt_all_floor: '전체 층',
        chip_all: '전체',
        chip_multi: '다중보관',
        chip_low: '부족주의',
        btn_expand_all: '모두 펼치기',
        btn_collapse_all: '모두 접기',
        btn_inv_add: '품목 입고',
        th_code: '코드',
        th_name: '프로파일 명',
        th_length: '길이',
        th_color: '색상',
        th_locations: '보관 위치 (클릭 시 3D 확인)',
        th_total: '합계',
        th_actions: '관리',
        preview_title: '3D 보관 위치',
        preview_hint: '테이블 행이나 보관 위치를 클릭하면 3D 지도에서 바로 표시됩니다.',
        btn_open_full_map: '크게',
        modal_rack_fac: '소속 동 (Facility)',
        modal_rack_floor: '층수 (Floor)',
        modal_rack_code: '랙 코드 (ID / 라벨)',
        modal_rack_tiers: '단수 (Tiers: 1~10)',
        modal_rack_name: '랙 명칭',
        modal_rack_desc: '상세 설명',
        modal_rack_w: '가로 W (m)',
        modal_rack_d: '깊이 D (m)',
        modal_rack_h: '높이 H (m)',
        modal_rack_x: 'X 좌표',
        modal_rack_z: 'Z 좌표',
        modal_prof_rack: '보관 랙 (Rack)',
        modal_prof_tier: '적재 단수 (Tier)',
        modal_prof_layer: '위치 라벨 (Layer)',
        modal_prof_code: '프로파일 코드 *',
        modal_prof_material: '재질 (Material)',
        modal_prof_name: '품목명 *',
        modal_prof_length: '길이 (Length)',
        modal_prof_color: '색상 (Color)',
        modal_prof_qty: '현재 재고 수량 (EA)',
        modal_prof_minqty: '안전재고 기준 (EA)',
        modal_move_title: '보관 위치 이동 / 분할 적재',
        modal_move_rack: '이동할 랙 (Target Rack)',
        modal_move_tier: '이동할 단수 (Tier)',
        modal_move_qty: '이동 수량 (EA) — 전체 이동 또는 일부 분할 이동',
        btn_move_all: '전량',
        btn_move_exec: '이동 실행',
        btn_cancel: '취소',
        btn_save: '저장하기',
        btn_confirm: '확인',
        lbl_length: '길이',
        lbl_color: '색상',
        btn_edit: '편집',
        btn_delete: '삭제',
        btn_move: '이동',
        btn_stock_in: '입고',
        unit_types: '종',
        unit_cases: '건',
        unit_locs: '곳',
        single_tier_hint: '단일 층(1단) 적재 구역입니다. 우측 [+ 단 추가]로 다단 랙으로 전환할 수 있습니다.',
        all_locations_btn: '전체 위치 보기',
        btn_excel_export: '엑셀 내보내기',
        btn_excel_import: '엑셀 가져오기',
        modal_excel_title: '엑셀 파일 가져오기 (Import)',
        modal_excel_file: '선택된 파일:',
        modal_excel_summary: '파싱 결과:',
        modal_excel_desc: '가져온 엑셀 데이터를 현재 3D 인벤토리에 어떻게 반영할까요?',
        btn_excel_replace: '전체 덮어쓰기 (기존 데이터 대체)',
        btn_excel_merge: '기존 데이터와 병합 / 업데이트',
        btn_save_html: '공유용 저장',
        btn_save_json: 'data.json 저장',
        btn_json_import: 'JSON 불러오기',
        btn_sync_json: 'JSON 동기화',
        cloud_disconnected: 'DB 설정',
        cloud_connected: '실시간 동기화',
        cloud_syncing: '저장 중...',
        cloud_error: 'DB 오류',
        btn_cloud_save: '서버 저장',
        modal_sb_title: 'Supabase 실시간 클라우드 동기화',
        modal_sb_url: 'Supabase Project URL *',
        modal_sb_key: 'Supabase Anon / Publishable Key *',
        modal_sb_schema_label: '정규화 테이블 구조 (3NF)',
        modal_sb_autosync: '수정 즉시 자동 서버 저장 및 실시간 수신 (Auto-Sync)',
        modal_sb_sql_title: '1회 초기 테이블 생성 SQL (Supabase SQL Editor)',
        btn_copy_sql: 'SQL 복사',
        modal_sb_hint: '모든 컴퓨터에서 별도 입력 없이 바로 연동되게 하려면, app.js 상단의 DEFAULT_SUPABASE_CONFIG에 URL과 Anon Key를 입력해 GitHub에 배포하세요.',
        btn_cloud_pull: '서버 데이터 불러오기',
        btn_cloud_push: '현재 데이터 서버 저장',
        btn_sb_disconnect: '설정 초기화',
        btn_sb_connect: '연결 저장 & 동기화'
    },
    en: {
        nav_map: '3D Factory Map',
        nav_inv: 'Full Inventory',
        btn_add_rack: 'Add Rack',
        btn_full_view: 'Full View',
        search_placeholder: 'Search profile code (e.g. AL-4040)',
        edit_on: 'Layout Edit ON',
        edit_off: 'Layout Edit OFF',
        sub_map: 'Click any 3D Rack to inspect stored aluminum profiles and stock.',
        sub_inv: 'Select a row or location in the table to preview its 3D position on the right.',
        zone_all: 'All Facilities',
        zone_c: 'Fac C (Left)',
        zone_a: 'Fac A (Center)',
        zone_b: 'Fac B (Right)',
        floor_all: 'All Floors',
        floor_1f: 'Ground (1F)',
        floor_2f: 'Mezzanine (2F)',
        floor_short_all: 'All',
        legend_normal: 'Normal',
        legend_warning: 'Low Stock',
        legend_selected: 'Selected',
        guide_click: 'Click/Tap: Select Rack',
        guide_pan: 'Drag: Pan Map',
        guide_zoom: 'Wheel/Pinch: Zoom',
        editor_title: 'Rack Layout & Tiers',
        editor_x: 'X Pos (Left/Right)',
        editor_z: 'Z Pos (Front/Back)',
        editor_w: 'Width W',
        editor_d: 'Depth D',
        editor_h: 'Height H',
        editor_tiers: 'Rack Tiers',
        btn_tier_minus: '- Tier',
        btn_tier_plus: '+ Tier',
        editor_snap: '0.5m Grid Snap',
        editor_autosave: 'Auto-saved',
        btn_new_rack: 'New Rack',
        btn_del_rack: 'Delete Rack',
        btn_copy_json: 'Copy Layout JSON',
        btn_edit_rack: 'Edit Rack',
        panel_select_title: 'Select a Rack',
        panel_select_sub: 'Click a warehouse rack on the 3D map to view its profile inventory.',
        tier_manage_title: 'Rack Tiers & Filter',
        btn_del_tier: 'Del Tier',
        btn_add_tier: 'Add Tier',
        tier_add_item_hint: 'Add a profile to the selected rack/tier',
        btn_add_item: 'Add Item',
        empty_title: 'Select a Rack on the 3D Map',
        empty_desc: 'Click any storage zone to view stored aluminum<br>profile specifications and live quantities.',
        summary_items: 'Total Items: ',
        summary_qty: 'Total Stock: ',
        status_normal: 'In Stock',
        status_warning: 'Low Stock Alert',
        kpi_types: 'Profile Types',
        kpi_multi: 'Multi-Location (2+)',
        kpi_qty: 'Total Factory Stock',
        kpi_low: 'Low Stock Locations',
        inv_search_ph: 'Search code, name, length, color, rack...',
        opt_all_fac: 'All Facs',
        opt_all_floor: 'All Floors',
        chip_all: 'All',
        chip_multi: 'Multi-Loc',
        chip_low: 'Low Stock',
        btn_expand_all: 'Expand All',
        btn_collapse_all: 'Collapse All',
        btn_inv_add: 'Stock In',
        th_code: 'Code',
        th_name: 'Profile Name',
        th_length: 'Length',
        th_color: 'Color',
        th_locations: 'Locations (Click for 3D)',
        th_total: 'Total',
        th_actions: 'Actions',
        preview_title: '3D Location',
        preview_hint: 'Click a row or location chip to highlight it on the 3D map.',
        btn_open_full_map: 'Expand',
        modal_rack_fac: 'Facility',
        modal_rack_floor: 'Floor',
        modal_rack_code: 'Rack Code (ID / Label)',
        modal_rack_tiers: 'Tiers (1~10)',
        modal_rack_name: 'Rack Name',
        modal_rack_desc: 'Description',
        modal_rack_w: 'Width W (m)',
        modal_rack_d: 'Depth D (m)',
        modal_rack_h: 'Height H (m)',
        modal_rack_x: 'X Coord',
        modal_rack_z: 'Z Coord',
        modal_prof_rack: 'Storage Rack',
        modal_prof_tier: 'Tier',
        modal_prof_layer: 'Layer Label',
        modal_prof_code: 'Profile Code *',
        modal_prof_material: 'Material',
        modal_prof_name: 'Profile Name *',
        modal_prof_length: 'Length',
        modal_prof_color: 'Color',
        modal_prof_qty: 'Current Quantity (EA)',
        modal_prof_minqty: 'Safety Stock (EA)',
        modal_move_title: 'Move / Split Stock Location',
        modal_move_rack: 'Target Rack',
        modal_move_tier: 'Target Tier',
        modal_move_qty: 'Move Qty (EA) — Full or Partial',
        btn_move_all: 'Max',
        btn_move_exec: 'Move Stock',
        btn_cancel: 'Cancel',
        btn_save: 'Save',
        btn_confirm: 'Confirm',
        lbl_length: 'Length',
        lbl_color: 'Color',
        btn_edit: 'Edit',
        btn_delete: 'Delete',
        btn_move: 'Move',
        btn_stock_in: 'Add Loc',
        unit_types: 'types',
        unit_cases: 'items',
        unit_locs: 'locs',
        single_tier_hint: 'Single-tier zone. Click [+ Add Tier] on the right to convert to multi-tier.',
        all_locations_btn: 'All Locations',
        btn_excel_export: 'Export Excel',
        btn_excel_import: 'Import Excel',
        modal_excel_title: 'Import Excel File',
        modal_excel_file: 'Selected File:',
        modal_excel_summary: 'Parsed Rows:',
        modal_excel_desc: 'How would you like to apply the imported Excel data?',
        btn_excel_replace: 'Replace All (Overwrite current inventory)',
        btn_excel_merge: 'Merge / Update existing inventory',
        btn_save_html: 'Save for Share',
        btn_save_json: 'Save data.json',
        btn_json_import: 'Import JSON',
        btn_sync_json: 'Sync JSON',
        cloud_disconnected: 'DB Setup',
        cloud_connected: 'Live Sync',
        cloud_syncing: 'Saving...',
        cloud_error: 'DB Error',
        btn_cloud_save: 'Save Cloud',
        modal_sb_title: 'Supabase Real-Time Cloud Sync',
        modal_sb_url: 'Supabase Project URL *',
        modal_sb_key: 'Supabase Anon / Publishable Key *',
        modal_sb_schema_label: 'Normalized Database Tables (3NF)',
        modal_sb_autosync: 'Auto-save edits & receive real-time updates (Auto-Sync)',
        modal_sb_sql_title: 'One-Time Table Setup SQL (Supabase SQL Editor)',
        btn_copy_sql: 'Copy SQL',
        modal_sb_hint: 'To auto-connect every computer without typing credentials, enter URL & Anon Key into DEFAULT_SUPABASE_CONFIG in app.js and deploy to GitHub.',
        btn_cloud_pull: 'Pull from Cloud',
        btn_cloud_push: 'Save to Cloud Now',
        btn_sb_disconnect: 'Reset Config',
        btn_sb_connect: 'Save & Sync'
    }
};

function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.ko[key] || key;
}

function formatTier(n) {
    return currentLang === 'en' ? `L${n}` : `${n}단`;
}

function toggleLanguage() {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);
    applyLanguage();
    showToast(currentLang === 'en' ? 'Language switched to English.' : '언어가 한국어로 변경되었습니다.');
}

function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.title = currentLang === 'en' ? 'Smart Factory 3D Inventory Kiosk' : '스마트 팩토리 3D 인벤토리 키오스크';
    const langLabel = document.getElementById('lang-label');
    if (langLabel) langLabel.textContent = currentLang === 'en' ? '한글' : 'EN';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = t(key);
        if (val.includes('<br>')) {
            el.innerHTML = val;
        } else {
            el.textContent = val;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    const editModeText = document.getElementById('edit-mode-text');
    if (editModeText) editModeText.textContent = isEditMode ? t('edit_on') : t('edit_off');

    const subtitle = document.getElementById('header-subtitle');
    if (subtitle) subtitle.textContent = currentPage === 'inventory' ? t('sub_inv') : t('sub_map');

    const activeBlock = factoryBlocksData.find(b => b.id === selectedBlockId);
    if (activeBlock) {
        populateEditorInputs(activeBlock);
        renderSidePanel(activeBlock, selectedTier);
    }
    if (currentPage === 'inventory') {
        renderInventoryPage();
        if (previewedProfileKey) {
            previewProfileOn3D(previewedProfileKey, previewFocusLocation?.blockId || null, previewFocusLocation?.tier ?? null);
        }
    } else {
        updateInventoryNavBadge();
    }
    if (typeof updateCloudStatusBadge === 'function') {
        updateCloudStatusBadge();
    }
}

// 색상 상수 (도면의 깔끔한 CAD/모던 팩토리 톤 반영)
const COLORS = {
    normal: 0x94a3b8,    // 기본 슬레이트 그레이 (도면 블록 톤)
    warning: 0xf59e0b,   // 앰버 (부족 주의)
    selected: 0xef4444,  // 도면의 A 구역처럼 강렬한 레드 하이라이트
    wall: 0x334155,      // 건물 외벽 및 격벽
    floorPlate: 0x1e293b // 건물 바닥판
};

function init3D() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.009);

    // 카메라 (도면과 유사한 전체 조감도 시점으로 시작)
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 38, 44);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableRotate = false; // 회전 비활성화 (이동과 줌만 사용)
    controls.enablePan = true;
    controls.screenSpacePanning = false; // 바닥 평면(X, Z) 기준으로 이동
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };
    controls.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_PAN
    };
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 95;

    // 3D 기즈모(TransformControls) 초기화 - 랙 드래그 이동용
    transformControl = new THREE.TransformControls(camera, renderer.domElement);
    transformControl.setMode('translate');
    transformControl.showY = false; // 바닥 평면(X, Z)에서만 이동하도록 제한
    transformControl.setTranslationSnap(0.5); // 기본 0.5 단위 스냅
    scene.add(transformControl);

    // 기즈모 드래그 시 카메라 회전 일시 중지 및 드래그 종료 시 자동 저장
    transformControl.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value;
        if (!event.value) {
            if (typeof pendingRemoteBlocks !== 'undefined' && pendingRemoteBlocks) {
                const queued = pendingRemoteBlocks;
                pendingRemoteBlocks = null;
                applyRemoteBlocksFromCloud(queued, null, true);
            } else {
                saveFactoryData();
            }
        }
    });
    transformControl.addEventListener('objectChange', () => {
        syncInputsFromGizmo();
    });

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(20, 50, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 40;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // 층별 그룹 생성
    floorGroups.GROUND = new THREE.Group();
    floorGroups.MEZZANINE = new THREE.Group();
    scene.add(floorGroups.GROUND);
    scene.add(floorGroups.MEZZANINE);

    // 공장 건축 구조물 (Fac C, Fac A, Fac B 외벽 및 중층 바닥) 생성
    createFactoryArchitecture();

    // 도면의 각 랙 및 야드 블록 생성
    createInventoryBlocks();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 초기 진입 시 첫 번째 구역(또는 C-1F-A1) 자동 선택
    setTimeout(() => {
        if (factoryBlocksData.length > 0) {
            const defaultBlock = factoryBlocksData.find(b => b.id === "C-1F-A1") || factoryBlocksData[0];
            selectBlock(defaultBlock.id, false, null);
        }
    }, 300);

    animate();
}

/**
 * 도면의 3개 동(Fac C, Fac A, Fac B) 건축 구조와 Mezzanine(2층) 구조 생성
 */
function createFactoryArchitecture() {
    // 전체 대지 바닥
    const baseGround = new THREE.Mesh(
        new THREE.PlaneGeometry(72, 46),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    baseGround.rotation.x = -Math.PI / 2;
    baseGround.position.set(0, -0.05, 5);
    baseGround.receiveShadow = true;
    scene.add(baseGround);

    const grid = new THREE.GridHelper(72, 36, 0x1e293b, 0x1e293b);
    grid.position.set(0, -0.02, 5);
    scene.add(grid);

    // 3개 동 정의 (좌: Fac C, 중: Fac A, 우: Fac B)
    const facilities = [
        { name: "Fac C", x: -18.5, w: 15, d: 13 },
        { name: "Fac A", x: -1.5,  w: 15, d: 13 },
        { name: "Fac B", x: 17.5,  w: 16, d: 13 }
    ];

    facilities.forEach(fac => {
        // 1. Ground (1층) 건물 바닥 & 낮은 외벽 프레임
        buildFacilityShell(floorGroups.GROUND, fac.x, 0, 3.5, fac.w, fac.d, 2.6, false);

        // 건물 전면 앞쪽 3D 간판 (Fac C, Fac A, Fac B)
        const titleSprite = createTextSprite(fac.name.toUpperCase(), "#f8fafc", 46);
        titleSprite.position.set(fac.x, 1.2, 21.5);
        scene.add(titleSprite);

        // 2. Mezzanine (2층 중층) 반투명 슬래브 및 외벽 프레임
        buildFacilityShell(floorGroups.MEZZANINE, fac.x, 6.5, 3.5, fac.w, fac.d, 2.2, true);
    });

    // 좌측 층수 표기 라벨 (GROUND / MEZZANINE)
    const gLabel = createTextSprite("GROUND (1F)", "#38bdf8", 32);
    gLabel.position.set(-30, 1.5, 3.5);
    floorGroups.GROUND.add(gLabel);

    const mLabel = createTextSprite("MEZZANINE (2F)", "#818cf8", 32);
    mLabel.position.set(-30, 7.5, 3.5);
    floorGroups.MEZZANINE.add(mLabel);
}

/**
 * 각 공장 동(Fac)의 바닥판, 중앙 격벽, 테두리 외벽을 도면처럼 생성
 */
function buildFacilityShell(parentGroup, cx, cy, cz, w, d, wallH, isMezzanine) {
    const slabGeo = new THREE.BoxGeometry(w, 0.2, d);
    const slabMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        transparent: isMezzanine,
        opacity: isMezzanine ? 0.55 : 0.95,
        roughness: 0.8
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.set(cx, cy, cz);
    slab.receiveShadow = true;
    parentGroup.add(slab);

    const edges = new THREE.EdgesGeometry(slabGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: isMezzanine ? 0x6366f1 : 0x475569 }));
    line.position.copy(slab.position);
    parentGroup.add(line);

    const wallMat = new THREE.MeshStandardMaterial({
        color: isMezzanine ? 0x4338ca : 0x334155,
        transparent: true,
        opacity: isMezzanine ? 0.25 : 0.45,
        side: THREE.DoubleSide
    });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, 0.15), wallMat);
    backWall.position.set(cx, cy + wallH / 2, cz - d / 2);
    parentGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, wallH, d), wallMat);
    leftWall.position.set(cx - w / 2, cy + wallH / 2, cz);
    parentGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, wallH, d), wallMat);
    rightWall.position.set(cx + w / 2, cy + wallH / 2, cz);
    parentGroup.add(rightWall);

    const midWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, wallH * 0.85, d), wallMat);
    midWall.position.set(cx - 0.5, cy + (wallH * 0.85) / 2, cz);
    parentGroup.add(midWall);
}

/**
 * 단일 랙 블록 3D 그룹 생성 및 등록
 */
function buildSingleBlockGroup(data) {
    const targetGroup = data.floor === "GROUND" ? floorGroups.GROUND : floorGroups.MEZZANINE;
    const blockGroup = new THREE.Group();
    data.pos.y = data.floor === "MEZZANINE" ? 6.5 : 0;
    blockGroup.position.set(data.pos.x, data.pos.y, data.pos.z);

    recalculateBlockStatus(data);
    const initColor = data.status === 'warning' ? COLORS.warning : COLORS.normal;
    const tierCount = Math.max(1, parseInt(data.tiers) || 1);
    data.tiers = tierCount;

    const gap = tierCount > 1 ? 0.08 : 0;
    const singleTierH = Math.max(0.15, (data.size.h - gap * (tierCount - 1)) / tierCount);

    for (let t = 1; t <= tierCount; t++) {
        const boxGeo = new THREE.BoxGeometry(data.size.w, singleTierH, data.size.d);
        const tierColor = (tierCount > 1 && t % 2 === 0 && data.status !== 'warning') ? 0x7c8ea6 : initColor;

        const boxMat = new THREE.MeshStandardMaterial({
            color: tierColor,
            emissive: 0x000000,
            emissiveIntensity: 0,
            roughness: 0.4,
            metalness: 0.2
        });

        const mesh = new THREE.Mesh(boxGeo, boxMat);
        const yOffset = 0.1 + (t - 1) * (singleTierH + gap) + singleTierH / 2;
        mesh.position.y = yOffset;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = {
            blockData: data,
            parentGroup: blockGroup,
            tier: tierCount > 1 ? t : 1
        };
        blockGroup.add(mesh);
        interactiveMeshes.push(mesh);

        const edges = new THREE.EdgesGeometry(boxGeo);
        const edgeLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 }));
        edgeLine.position.copy(mesh.position);
        edgeLine.name = `edgeLine_${t}`;
        blockGroup.add(edgeLine);
    }

    const labelSprite = createTextSprite(data.codeLabel, "#ffffff", 26);
    labelSprite.position.set(0, data.size.h + 0.9, 0);
    labelSprite.name = "labelSprite";
    blockGroup.add(labelSprite);

    targetGroup.add(blockGroup);
    blockGroupsMap[data.id] = blockGroup;
    return blockGroup;
}

/**
 * 전체 인벤토리 랙 3D 생성
 */
function createInventoryBlocks() {
    factoryBlocksData.forEach(data => {
        buildSingleBlockGroup(data);
    });
}

/**
 * 특정 랙(blockId)의 3D 메쉬를 제거하고 최신 데이터로 재생성 (단수 추가/삭제, 크기/층 변경 시 사용)
 */
function rebuildSingleBlock3D(blockId) {
    const oldGroup = blockGroupsMap[blockId];
    if (oldGroup) {
        if (transformControl.object === oldGroup) {
            transformControl.detach();
        }
        if (oldGroup.parent) {
            oldGroup.parent.remove(oldGroup);
        }
        oldGroup.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
            }
        });
        delete blockGroupsMap[blockId];
    }
    interactiveMeshes = interactiveMeshes.filter(m => m.userData.blockData.id !== blockId);

    const data = factoryBlocksData.find(b => b.id === blockId);
    if (data) {
        const newGroup = buildSingleBlockGroup(data);
        applySelectionHighlight(selectedBlockId, selectedTier);
        if (isEditMode && selectedBlockId === blockId) {
            transformControl.attach(newGroup);
        }
    }
}

/**
 * 모든 랙 3D 메쉬 초기화 후 재생성
 */
function rebuildAllBlocks3D() {
    transformControl.detach();
    Object.keys(blockGroupsMap).forEach(id => {
        const grp = blockGroupsMap[id];
        if (grp && grp.parent) grp.parent.remove(grp);
        if (grp) {
            grp.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            });
        }
    });
    blockGroupsMap = {};
    interactiveMeshes = [];
    createInventoryBlocks();
}

function createTextSprite(text, color = "#ffffff", fontSize = 26) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    ctx.font = `bold ${fontSize}px 'Inter', 'Noto Sans KR', sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 8;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(9, 2.25, 1);
    return sprite;
}

/**
 * 3. 마우스 및 터치 인터랙션
 */
function updateMouseCoords(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerMove(event) {
    updateMouseCoords(event);
    raycaster.setFromCamera(mouse, camera);

    const visibleMeshes = interactiveMeshes.filter(m => m.parent && m.parent.parent && m.parent.parent.visible);
    const intersects = raycaster.intersectObjects(visibleMeshes);
    const tooltip = document.getElementById('hover-tooltip');

    if (intersects.length > 0) {
        const hit = intersects[0].object.userData;
        const data = hit.blockData;
        document.body.style.cursor = 'pointer';

        const isMultiTier = (data.tiers || 1) > 1;
        const tierText = (isMultiTier && hit.tier) ? ` • ${formatTier(hit.tier)}` : '';
        const matchingProfiles = (isMultiTier && hit.tier)
            ? data.profiles.filter(p => (p.tier || 1) === hit.tier)
            : data.profiles;

        document.getElementById('tooltip-title').textContent = `${data.codeLabel}${tierText}`;
        document.getElementById('tooltip-desc').textContent = currentLang === 'en'
            ? `${data.name} (${matchingProfiles.length} profiles stored)`
            : `${data.name} (${matchingProfiles.length}종 프로파일 적재)`;
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 15}px`;
        tooltip.classList.remove('hidden');
    } else {
        document.body.style.cursor = 'default';
        tooltip.classList.add('hidden');
    }
}

let pointerDownPos = { x: 0, y: 0 };
function onPointerDown(event) {
    pointerDownPos = { x: event.clientX, y: event.clientY };
    
    const onPointerUp = (upEvent) => {
        const dist = Math.hypot(upEvent.clientX - pointerDownPos.x, upEvent.clientY - pointerDownPos.y);
        if (dist < 6) {
            updateMouseCoords(upEvent);
            raycaster.setFromCamera(mouse, camera);
            const visibleMeshes = interactiveMeshes.filter(m => m.parent && m.parent.parent && m.parent.parent.visible);
            const intersects = raycaster.intersectObjects(visibleMeshes);
            if (intersects.length > 0) {
                const hit = intersects[0].object.userData;
                const isMultiTier = (hit.blockData.tiers || 1) > 1;

                if (currentPage === 'inventory') {
                    const hitTier = isMultiTier ? hit.tier : null;
                    previewSingleRackInInventory(hit.blockData.id, hitTier);
                    return;
                }

                let targetTier = null;
                // 이미 선택된 다단 랙을 다시 클릭한 경우에만 특정 단(Tier) 선택/해제 토글
                if (hit.blockData.id === selectedBlockId && isMultiTier) {
                    targetTier = (selectedTier === hit.tier) ? null : hit.tier;
                }
                selectBlock(hit.blockData.id, true, targetTier);
            }
        }
        window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointerup', onPointerUp);
}

/**
 * 4. 블록 및 특정 단(Tier) 선택 시 하이라이트 + 카메라 포커싱 + 우측 패널 업데이트
 */
function applySelectionHighlight(blockId, tier = null) {
    let selectedGroup = null;
    interactiveMeshes.forEach(mesh => {
        const bData = mesh.userData.blockData;
        const mTier = mesh.userData.tier;

        if (bData.id === blockId) {
            selectedGroup = mesh.userData.parentGroup;
            if (tier !== null && (bData.tiers || 1) > 1 && mTier !== null) {
                if (mTier === tier) {
                    mesh.material.color.setHex(COLORS.selected);
                    mesh.material.emissive.setHex(COLORS.selected);
                    mesh.material.emissiveIntensity = 0.55;
                } else {
                    mesh.material.color.setHex(0xfca5a5);
                    mesh.material.emissive.setHex(COLORS.selected);
                    mesh.material.emissiveIntensity = 0.12;
                }
            } else {
                mesh.material.color.setHex(COLORS.selected);
                mesh.material.emissive.setHex(COLORS.selected);
                mesh.material.emissiveIntensity = 0.45;
            }
        } else {
            const isEvenTier = (bData.tiers || 1) > 1 && mTier % 2 === 0;
            const origColor = bData.status === 'warning' ? COLORS.warning : (isEvenTier ? 0x7c8ea6 : COLORS.normal);
            mesh.material.color.setHex(origColor);
            mesh.material.emissive.setHex(0x000000);
            mesh.material.emissiveIntensity = 0;
        }
    });
    return selectedGroup;
}

function selectBlock(blockId, moveCamera = true, tier = null) {
    selectedBlockId = blockId;
    selectedTier = tier;
    selectedProfileIndex = null;
    const data = factoryBlocksData.find(b => b.id === blockId);
    if (!data) return;

    if (data.floor === "GROUND" && !floorGroups.GROUND.visible) {
        setFloorFilter('ALL');
    } else if (data.floor === "MEZZANINE" && !floorGroups.MEZZANINE.visible) {
        setFloorFilter('ALL');
    }

    const selectedGroup = applySelectionHighlight(blockId, tier);

    if (isEditMode && selectedGroup) {
        transformControl.attach(selectedGroup);
        populateEditorInputs(data);
    } else if (selectedBlockId) {
        populateEditorInputs(data);
    }

    if (moveCamera && !isEditMode) {
        targetCameraPos = new THREE.Vector3(data.pos.x, data.pos.y + 18, data.pos.z + 20);
        targetControlsLookAt = new THREE.Vector3(data.pos.x, data.pos.y + 1, data.pos.z);
    }

    renderSidePanel(data, tier);
}

/**
 * 5. 배치 편집 모드(Layout Editor) & 좌표/크기/스냅/초기화 제어 함수들
 */
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('btn-edit-mode');
    const btnText = document.getElementById('edit-mode-text');
    const panel = document.getElementById('layout-editor-panel');

    if (isEditMode) {
        btn.classList.replace('bg-slate-800', 'bg-amber-500/20');
        btn.classList.replace('border-slate-700', 'border-amber-400');
        btnText.textContent = t('edit_on');
        btnText.classList.add('text-amber-300', 'font-bold');
        panel.classList.remove('hidden');

        if (selectedBlockId) {
            const group = blockGroupsMap[selectedBlockId];
            const data = factoryBlocksData.find(b => b.id === selectedBlockId);
            if (group && data) {
                transformControl.attach(group);
                populateEditorInputs(data);
            }
        }
        showToast(currentLang === 'en' ? "Layout Edit Mode ON: Changes auto-save." : "배치 편집 모드 활성화: 랙 이동/크기/단수 조율 내용이 자동 저장됩니다.");
    } else {
        btn.classList.replace('bg-amber-500/20', 'bg-slate-800');
        btn.classList.replace('border-amber-400', 'border-slate-700');
        btnText.textContent = t('edit_off');
        btnText.classList.remove('text-amber-300', 'font-bold');
        panel.classList.add('hidden');
        transformControl.detach();
        saveFactoryData();
        showToast(currentLang === 'en' ? "Layout saved to browser storage." : "배치 편집 완료: 변경된 위치와 크기가 브라우저에 저장되었습니다.");
    }
}

function populateEditorInputs(data) {
    if (!data) return;
    document.getElementById('editor-target-id').textContent = `${data.id}`;
    document.getElementById('edit-pos-x').value = Number(data.pos.x.toFixed(2));
    document.getElementById('edit-pos-z').value = Number(data.pos.z.toFixed(2));
    document.getElementById('edit-size-w').value = Number(data.size.w.toFixed(2));
    document.getElementById('edit-size-d').value = Number(data.size.d.toFixed(2));
    document.getElementById('edit-size-h').value = Number(data.size.h.toFixed(2));
    document.getElementById('edit-tier-count').textContent = formatTier(data.tiers || 1);
}

function syncInputsFromGizmo() {
    if (!transformControl.object || !selectedBlockId) return;
    const data = factoryBlocksData.find(b => b.id === selectedBlockId);
    if (!data) return;

    data.pos.x = Number(transformControl.object.position.x.toFixed(2));
    data.pos.z = Number(transformControl.object.position.z.toFixed(2));
    populateEditorInputs(data);
    saveFactoryData();
}

function updateBlockFromInputs() {
    if (!selectedBlockId) return;
    const data = factoryBlocksData.find(b => b.id === selectedBlockId);
    const blockMeshes = interactiveMeshes.filter(m => m.userData.blockData.id === selectedBlockId);
    if (!data || blockMeshes.length === 0) return;

    const newX = parseFloat(document.getElementById('edit-pos-x').value) || 0;
    const newZ = parseFloat(document.getElementById('edit-pos-z').value) || 0;
    const newW = Math.max(0.5, parseFloat(document.getElementById('edit-size-w').value) || 1);
    const newD = Math.max(0.5, parseFloat(document.getElementById('edit-size-d').value) || 1);
    const newH = Math.max(0.5, parseFloat(document.getElementById('edit-size-h').value) || 1.5);

    data.pos.x = newX;
    data.pos.z = newZ;
    data.size.w = newW;
    data.size.d = newD;
    data.size.h = newH;

    const group = blockGroupsMap[selectedBlockId];
    if (group) {
        group.position.set(newX, data.pos.y, newZ);

        const tierCount = data.tiers || 1;
        const gap = tierCount > 1 ? 0.08 : 0;
        const singleTierH = Math.max(0.15, (data.size.h - gap * (tierCount - 1)) / tierCount);

        blockMeshes.forEach((mesh, idx) => {
            const t = idx + 1;
            mesh.geometry.dispose();
            const newGeo = new THREE.BoxGeometry(newW, singleTierH, newD);
            mesh.geometry = newGeo;
            const yOffset = 0.1 + (t - 1) * (singleTierH + gap) + singleTierH / 2;
            mesh.position.y = yOffset;

            const edgeLine = group.getObjectByName(`edgeLine_${t}`);
            if (edgeLine) {
                edgeLine.geometry.dispose();
                edgeLine.geometry = new THREE.EdgesGeometry(newGeo);
                edgeLine.position.copy(mesh.position);
            }
        });

        const labelSprite = group.getObjectByName("labelSprite");
        if (labelSprite) {
            labelSprite.position.set(0, data.size.h + 0.9, 0);
        }
    }

    saveFactoryData();
}

function toggleGridSnap() {
    const snapChecked = document.getElementById('edit-snap-grid').checked;
    transformControl.setTranslationSnap(snapChecked ? 0.5 : null);
    showToast(snapChecked ? "0.5m 격자 스냅이 켜졌습니다." : "격자 스냅이 해제되어 자유 이동합니다.");
}

function exportLayoutCoordinates() {
    const jsonStr = JSON.stringify(factoryBlocksData, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr).then(() => {
            showToast("전체 랙 배치 및 재고 JSON 데이터가 클립보드에 복사되었습니다.");
        }).catch(() => {
            showToast("클립보드 복사에 실패했습니다.");
        });
    } else {
        showToast("데이터가 브라우저 저장소에 이미 저장되어 있습니다.");
    }
}

function resetToDefaultData() {
    openConfirmModal(
        "초기 데이터로 복원",
        "조정한 모든 랙 위치/크기, 추가된 랙/단수 및 품목 데이터를 초기 상태로 되돌리시겠습니까?",
        () => {
            localStorage.removeItem(STORAGE_KEY);
            factoryBlocksData = loadFactoryData();
            rebuildAllBlocks3D();
            if (factoryBlocksData.length > 0) {
                selectBlock(factoryBlocksData[0].id, false, null);
            }
            saveFactoryData(true);
            showToast("모든 데이터가 초기 도면 상태로 복원되었습니다.");
        }
    );
}

/**
 * 6. 랙 다단(Tier) 추가/삭제 및 랙(Rack) 추가/수정/삭제 기능
 */
function changeSelectedRackTiers(delta) {
    if (!selectedBlockId) {
        showToast("먼저 3D 맵에서 랙을 선택해주세요.");
        return;
    }
    const data = factoryBlocksData.find(b => b.id === selectedBlockId);
    if (!data) return;

    const currentTiers = data.tiers || 1;
    const nextTiers = currentTiers + delta;

    if (nextTiers < 1) {
        showToast("최소 1단 이하로는 줄일 수 없습니다.");
        return;
    }
    if (nextTiers > 10) {
        showToast("최대 10단까지 추가할 수 있습니다.");
        return;
    }

    if (delta > 0) {
        // 1단 -> 다단으로 전환 시 기존 품목들의 tier가 없으면 1단으로 지정
        data.profiles.forEach(p => {
            if (!p.tier) p.tier = 1;
        });
        data.tiers = nextTiers;
        // 단 추가 시 높이가 너무 낮으면 자연스럽게 높이 확장
        if (data.size.h < nextTiers * 0.65) {
            data.size.h = Number((nextTiers * 0.7).toFixed(2));
        }
        rebuildSingleBlock3D(data.id);
        populateEditorInputs(data);
        renderSidePanel(data, selectedTier);
        saveFactoryData();
        showToast(`[${data.codeLabel}] 랙이 ${nextTiers}단 구조로 확장되었습니다.`);
    } else {
        // 최상단(currentTiers) 삭제 시 해당 단에 품목이 있는지 확인
        const itemsOnTopTier = data.profiles.filter(p => (p.tier || 1) === currentTiers);
        const applyTierRemoval = () => {
            itemsOnTopTier.forEach(p => {
                p.tier = nextTiers;
                p.layer = `${nextTiers}단`;
            });
            data.tiers = nextTiers;
            if (selectedTier && selectedTier > nextTiers) {
                selectedTier = nextTiers > 1 ? nextTiers : null;
            }
            if (nextTiers === 1) {
                selectedTier = null;
            }
            rebuildSingleBlock3D(data.id);
            populateEditorInputs(data);
            renderSidePanel(data, selectedTier);
            saveFactoryData();
            showToast(`[${data.codeLabel}] 랙이 ${nextTiers}단 구조로 변경되었습니다.`);
        };

        if (itemsOnTopTier.length > 0) {
            openConfirmModal(
                `${currentTiers}단 삭제 확인`,
                `삭제하려는 ${currentTiers}단에 ${itemsOnTopTier.length}종의 품목이 적재되어 있습니다. 단을 삭제하고 해당 품목들을 ${nextTiers}단으로 자동 이동할까요?`,
                applyTierRemoval
            );
        } else {
            applyTierRemoval();
        }
    }
}

function autoSuggestRackCode() {
    if (rackModalMode !== 'add') return;
    const fac = document.getElementById('rack-form-fac').value;
    const floor = document.getElementById('rack-form-floor').value;
    const facPrefix = fac.replace('Fac ', '').trim(); // C, A, B
    const floorCode = floor === 'GROUND' ? '1F' : '2F';
    const prefix = `${facPrefix}-${floorCode}-`;

    const existingCount = factoryBlocksData.filter(b => b.id.startsWith(prefix)).length;
    const nextChar = String.fromCharCode(65 + (existingCount % 26)); // A, B, C, D, E...
    const suggestedCode = `${prefix}${nextChar}1`;

    document.getElementById('rack-form-code').value = suggestedCode;
    document.getElementById('rack-form-name').value = `${suggestedCode} (신규 다단 프로파일 랙)`;
    document.getElementById('rack-form-desc').value = `${fac} 구역 • ${floorCode} 층 • ${nextChar}1 랙`;

    // 동별 기본 X 좌표 제안
    const defaultXMap = { "Fac C": -14.5, "Fac A": 0.5, "Fac B": 14.5 };
    document.getElementById('rack-form-x').value = defaultXMap[fac] ?? 0;
    document.getElementById('rack-form-z').value = 3.5;
}

function openRackModal(mode) {
    rackModalMode = mode;
    const modal = document.getElementById('rack-modal');
    const titleEl = document.getElementById('rack-modal-title');
    const codeInput = document.getElementById('rack-form-code');

    if (mode === 'edit') {
        if (!selectedBlockId) {
            showToast("수정할 랙을 먼저 선택해주세요.");
            return;
        }
        const data = factoryBlocksData.find(b => b.id === selectedBlockId);
        if (!data) return;

        titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square text-sky-400"></i> 랙(${data.codeLabel}) 정보 수정`;
        document.getElementById('rack-form-fac').value = data.fac || "Fac C";
        document.getElementById('rack-form-floor').value = data.floor || "GROUND";
        codeInput.value = data.codeLabel;
        document.getElementById('rack-form-tiers').value = data.tiers || 1;
        document.getElementById('rack-form-name').value = data.name || "";
        document.getElementById('rack-form-desc').value = data.desc || "";
        document.getElementById('rack-form-w').value = data.size.w;
        document.getElementById('rack-form-d').value = data.size.d;
        document.getElementById('rack-form-h').value = data.size.h;
        document.getElementById('rack-form-x').value = data.pos.x;
        document.getElementById('rack-form-z').value = data.pos.z;
    } else {
        titleEl.innerHTML = `<i class="fa-solid fa-warehouse text-sky-400"></i> 새 랙(구역) 추가`;
        const curData = selectedBlockId ? factoryBlocksData.find(b => b.id === selectedBlockId) : null;
        document.getElementById('rack-form-fac').value = curData ? curData.fac : "Fac C";
        document.getElementById('rack-form-floor').value = curData ? curData.floor : "GROUND";
        document.getElementById('rack-form-tiers').value = 4;
        document.getElementById('rack-form-w').value = 2.0;
        document.getElementById('rack-form-d').value = 8.0;
        document.getElementById('rack-form-h').value = 2.8;
        autoSuggestRackCode();
    }

    modal.classList.remove('hidden');
}

function closeRackModal() {
    document.getElementById('rack-modal').classList.add('hidden');
}

function saveRackModal() {
    const fac = document.getElementById('rack-form-fac').value;
    const floor = document.getElementById('rack-form-floor').value;
    const code = document.getElementById('rack-form-code').value.trim();
    const tiers = Math.min(10, Math.max(1, parseInt(document.getElementById('rack-form-tiers').value) || 1));
    const name = document.getElementById('rack-form-name').value.trim() || `${code} 랙`;
    const desc = document.getElementById('rack-form-desc').value.trim() || `${fac} 구역 • ${floor === 'GROUND' ? '1F' : '2F'} 층`;
    const w = Math.max(0.5, parseFloat(document.getElementById('rack-form-w').value) || 2.0);
    const d = Math.max(0.5, parseFloat(document.getElementById('rack-form-d').value) || 8.0);
    const h = Math.max(0.5, parseFloat(document.getElementById('rack-form-h').value) || 2.5);
    const x = parseFloat(document.getElementById('rack-form-x').value) || 0;
    const z = parseFloat(document.getElementById('rack-form-z').value) || 0;
    const y = floor === "MEZZANINE" ? 6.5 : 0;

    if (!code) {
        showToast("랙 코드(ID)를 입력해주세요.");
        return;
    }

    if (rackModalMode === 'add') {
        if (factoryBlocksData.some(b => b.id.toUpperCase() === code.toUpperCase())) {
            showToast(`이미 존재하는 랙 코드(${code})입니다.`);
            return;
        }

        const newRack = {
            id: code,
            fac,
            floor,
            codeLabel: code,
            name,
            desc,
            pos: { x, y, z },
            size: { w, h, d },
            status: "normal",
            tiers,
            profiles: []
        };

        factoryBlocksData.push(newRack);
        buildSingleBlockGroup(newRack);
        saveFactoryData();
        closeRackModal();
        selectBlock(newRack.id, true, null);
        showToast(`새 랙 [${code}] (${tiers}단)이 추가되었습니다.`);
    } else {
        const data = factoryBlocksData.find(b => b.id === selectedBlockId);
        if (!data) return;

        // 코드가 변경된 경우 중복 검사
        if (code !== data.id && factoryBlocksData.some(b => b.id.toUpperCase() === code.toUpperCase())) {
            showToast(`이미 존재하는 랙 코드(${code})입니다.`);
            return;
        }

        const oldId = data.id;
        data.id = code;
        data.codeLabel = code;
        data.fac = fac;
        data.floor = floor;
        data.name = name;
        data.desc = desc;
        data.tiers = tiers;
        data.size = { w, h, d };
        data.pos = { x, y, z };

        // 줄어든 단수보다 높은 단에 있던 품목은 최상단으로 이동
        data.profiles.forEach(p => {
            if (p.tier && p.tier > tiers) {
                p.tier = tiers;
                p.layer = `${tiers}단`;
            } else if (!p.tier) {
                p.tier = 1;
            }
        });

        // 기존 ID 메쉬 정리 후 새 ID로 재생성
        if (oldId !== code) {
            const oldGroup = blockGroupsMap[oldId];
            if (oldGroup) {
                if (transformControl.object === oldGroup) transformControl.detach();
                if (oldGroup.parent) oldGroup.parent.remove(oldGroup);
                delete blockGroupsMap[oldId];
            }
            interactiveMeshes = interactiveMeshes.filter(m => m.userData.blockData.id !== oldId && m.userData.blockData.id !== code);
            selectedBlockId = code;
        }

        rebuildSingleBlock3D(code);
        saveFactoryData();
        closeRackModal();
        selectBlock(code, false, selectedTier && selectedTier <= tiers ? selectedTier : null);
        showToast(`[${code}] 랙 정보가 수정되었습니다.`);
    }
}

function deleteSelectedRack() {
    if (!selectedBlockId) {
        showToast("삭제할 랙을 먼저 선택해주세요.");
        return;
    }
    const data = factoryBlocksData.find(b => b.id === selectedBlockId);
    if (!data) return;

    openConfirmModal(
        `랙 [${data.codeLabel}] 삭제`,
        `'${data.name}' 구역과 내부에 적재된 품목(${data.profiles.length}종)을 모두 삭제하시겠습니까?`,
        () => {
            const targetId = data.id;
            factoryBlocksData = factoryBlocksData.filter(b => b.id !== targetId);
            rebuildSingleBlock3D(targetId);
            saveFactoryData();

            if (factoryBlocksData.length > 0) {
                selectBlock(factoryBlocksData[0].id, false, null);
            } else {
                selectedBlockId = null;
                selectedTier = null;
                document.getElementById('empty-state').classList.remove('hidden');
                document.getElementById('profile-cards').classList.add('hidden');
                document.getElementById('rack-tier-selector').classList.add('hidden');
                document.getElementById('rack-action-btns').classList.add('hidden');
                document.getElementById('panel-rack-title').textContent = '구역을 선택해주세요';
                document.getElementById('summary-item-count').textContent = '0 종';
                document.getElementById('summary-total-qty').textContent = '0 EA';
            }
            showToast(`[${data.codeLabel}] 랙이 삭제되었습니다.`);
        }
    );
}

/**
 * 7. 우측 사이드 패널 렌더링 & 품목(Profile) 추가/수정/삭제/수량조절
 */
function renderSidePanel(data, activeTier = null) {
    document.getElementById('empty-state').classList.add('hidden');
    const cardsContainer = document.getElementById('profile-cards');
    cardsContainer.classList.remove('hidden');

    const actionBtns = document.getElementById('rack-action-btns');
    actionBtns.classList.remove('hidden');
    actionBtns.classList.add('flex');

    recalculateBlockStatus(data);

    const tierSuffix = activeTier ? ` • ${formatTier(activeTier)}` : '';
    document.getElementById('panel-zone-badge').textContent = `${data.codeLabel}${tierSuffix}`;
    
    const statusBadge = document.getElementById('panel-status-badge');
    if (data.status === 'normal') {
        statusBadge.textContent = t('status_normal');
        statusBadge.className = 'px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    } else {
        statusBadge.textContent = t('status_warning');
        statusBadge.className = 'px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30';
    }

    document.getElementById('panel-rack-title').textContent = data.name;
    document.getElementById('panel-rack-subtitle').textContent = data.desc;

    // 랙 단수(Tier) 관리 및 필터 탭 바 (1단 랙이라도 단 추가/품목 추가가 가능하도록 항상 표시)
    const tierSelector = document.getElementById('rack-tier-selector');
    const tierButtons = document.getElementById('tier-buttons');
    const tierCount = data.tiers || 1;
    tierSelector.classList.remove('hidden');
    document.getElementById('tier-total-badge').textContent = currentLang === 'en' ? `${tierCount} Tiers` : `총 ${tierCount}단 구조`;
    tierButtons.innerHTML = '';

    if (tierCount > 1) {
        const allBtn = document.createElement('button');
        allBtn.textContent = `${t('floor_short_all')} (${data.profiles.length})`;
        allBtn.className = activeTier === null
            ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500 text-white shadow'
            : 'px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700';
        allBtn.onclick = () => selectBlock(data.id, false, null);
        tierButtons.appendChild(allBtn);

        for (let tIdx = 1; tIdx <= tierCount; tIdx++) {
            const countInTier = data.profiles.filter(p => (p.tier || 1) === tIdx).length;
            const btn = document.createElement('button');
            btn.innerHTML = `${formatTier(tIdx)} <span class="opacity-75 text-[10px]">(${countInTier})</span>`;
            btn.className = activeTier === tIdx
                ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500 text-white shadow'
                : 'px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700';
            btn.onclick = () => selectBlock(data.id, false, tIdx);
            tierButtons.appendChild(btn);
        }
    } else {
        const singleBadge = document.createElement('span');
        singleBadge.className = 'text-[11px] text-slate-400 px-1';
        singleBadge.textContent = t('single_tier_hint');
        tierButtons.appendChild(singleBadge);
    }

    // 원본 인덱스를 보존하면서 필터링
    const indexedProfiles = data.profiles
        .map((profile, idx) => ({ profile, idx }))
        .filter(item => activeTier ? (item.profile.tier || 1) === activeTier : true);

    cardsContainer.innerHTML = '';
    let totalQty = 0;

    if (indexedProfiles.length === 0) {
        cardsContainer.innerHTML = `
            <div class="p-6 text-center rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-2">
                <p>${currentLang === 'en' ? 'No profiles stored in this tier/rack.' : `${activeTier ? `해당 단(${activeTier}단)에는` : '이 랙에는'} 현재 적재된 프로파일이 없습니다.`}</p>
                <button onclick="openProfileModal('add')" class="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold transition inline-flex items-center gap-1">
                    <i class="fa-solid fa-plus"></i> ${t('btn_add_item')}
                </button>
            </div>
        `;
    }

    indexedProfiles.forEach(({ profile, idx }) => {
        totalQty += Number(profile.qty) || 0;
        const isLow = Number(profile.qty) <= Number(profile.minQty);
        const isSelected = selectedProfileIndex === idx;
        const layerLabel = currentLang === 'en' ? formatTier(profile.tier || 1) : (profile.layer || formatTier(profile.tier || 1));
        const lengthText = getProfileLength(profile) || '-';
        const colorText = getProfileColor(profile) || '-';

        const card = document.createElement('div');
        card.className = `p-3 rounded-xl cursor-pointer transition shadow-sm border ${
            isSelected
                ? 'bg-slate-800 border-sky-400 ring-1 ring-sky-400/30'
                : (isLow ? 'bg-slate-800/70 border-amber-500/50 hover:border-sky-400/60' : 'bg-slate-800/70 border-slate-700/80 hover:border-sky-400/60')
        }`;
        card.onclick = () => toggleProfileSelection(idx);

        card.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center flex-wrap gap-1.5 min-w-0">
                    <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-700">${profile.code}</span>
                    <span class="text-[11px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">${layerLabel}</span>
                </div>
                <div class="text-right shrink-0">
                    <span class="text-base font-bold ${isLow ? 'text-amber-400' : 'text-emerald-400'}">${Number(profile.qty).toLocaleString()}</span>
                    <span class="text-[11px] text-slate-400">EA</span>
                </div>
            </div>

            <h3 class="font-bold text-slate-100 text-sm mt-1.5 break-words">${profile.name}</h3>

            <div class="mt-1.5 flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>${t('lbl_length')}: <strong class="text-slate-200 font-medium">${lengthText}</strong></span>
                <span>${t('lbl_color')}: <strong class="text-slate-200 font-medium">${colorText}</strong></span>
            </div>

            ${isSelected ? `
            <div class="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                <div class="flex items-center gap-1">
                    <button onclick="event.stopPropagation(); adjustProfileQty(${idx}, -10)" class="px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 transition">-10</button>
                    <button onclick="event.stopPropagation(); adjustProfileQty(${idx}, -1)" class="px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 transition">-1</button>
                    <button onclick="event.stopPropagation(); adjustProfileQty(${idx}, 1)" class="px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 transition">+1</button>
                    <button onclick="event.stopPropagation(); adjustProfileQty(${idx}, 10)" class="px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 transition">+10</button>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="event.stopPropagation(); openProfileModal('edit', ${idx})" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition flex items-center gap-1">
                        <i class="fa-solid fa-pen text-sky-400"></i> ${t('btn_edit')}
                    </button>
                    <button onclick="event.stopPropagation(); deleteProfileItem(${idx})" class="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition flex items-center gap-1">
                        <i class="fa-solid fa-trash-can"></i> ${t('btn_delete')}
                    </button>
                </div>
            </div>
            ` : ''}
        `;
        cardsContainer.appendChild(card);
    });

    document.getElementById('summary-item-count').textContent = `${indexedProfiles.length} ${t('unit_types')}`;
    document.getElementById('summary-total-qty').textContent = `${totalQty.toLocaleString()} EA`;
}

function toggleProfileSelection(profileIdx) {
    if (!selectedBlockId) return;
    const data = factoryBlocksData.find(b => b.id === selectedBlockId);
    if (!data) return;
    selectedProfileIndex = (selectedProfileIndex === profileIdx) ? null : profileIdx;
    renderSidePanel(data, selectedTier);
}

// 품목 수량 빠른 증감
function adjustProfileQty(profileIdx, delta) {
    if (!selectedBlockId) return;
    const data = factoryBlocksData.find(b => b.id === selectedBlockId);
    if (!data || !data.profiles[profileIdx]) return;

    const item = data.profiles[profileIdx];
    item.qty = Math.max(0, (Number(item.qty) || 0) + delta);
    recalculateBlockStatus(data);
    applySelectionHighlight(selectedBlockId, selectedTier);
    saveFactoryData();
    renderSidePanel(data, selectedTier);
}

function getProfileLength(profile) {
    if (!profile) return '';
    if (profile.length !== undefined) return profile.length;
    const src = `${profile.spec || ''} ${profile.name || ''}`;
    const match = src.match(/L\s*=\s*([^/)\s]+)/i);
    return match ? match[1] : (profile.spec || '');
}

function getProfileColor(profile) {
    if (!profile) return '';
    if (profile.color !== undefined) return profile.color;
    const src = `${profile.name || ''} ${profile.spec || ''}`;
    if (src.includes('블랙')) return '블랙';
    if (src.includes('실버')) return '실버';
    if (src.includes('그레이')) return '그레이';
    if (src.includes('아노다이징')) return '아노다이징';
    return '';
}

function populateProfileRackAndTierSelects(selectedRackId, selectedTierVal) {
    const rackSelect = document.getElementById('profile-form-rack');
    rackSelect.innerHTML = '';
    factoryBlocksData.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.codeLabel} (${b.fac} · ${b.floor === 'MEZZANINE' ? '2F' : '1F'})`;
        rackSelect.appendChild(opt);
    });
    if (selectedRackId && factoryBlocksData.some(b => b.id === selectedRackId)) {
        rackSelect.value = selectedRackId;
    }
    populateProfileTierSelect(rackSelect.value, selectedTierVal);
}

function populateProfileTierSelect(rackId, preferredTier = 1) {
    const rackData = factoryBlocksData.find(b => b.id === rackId);
    const tierSelect = document.getElementById('profile-form-tier');
    const tierCount = rackData ? (rackData.tiers || 1) : 1;
    tierSelect.innerHTML = '';
    for (let t = 1; t <= tierCount; t++) {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = formatTier(t);
        tierSelect.appendChild(opt);
    }
    const clampedTier = Math.min(tierCount, Math.max(1, parseInt(preferredTier) || 1));
    tierSelect.value = clampedTier;
}

function onProfileRackSelectChange() {
    const rackId = document.getElementById('profile-form-rack').value;
    modalTargetBlockId = rackId;
    populateProfileTierSelect(rackId, 1);
    onProfileTierSelectChange();
}

function onProfileTierSelectChange() {
    const tierVal = document.getElementById('profile-form-tier').value;
    document.getElementById('profile-form-layer').value = formatTier(tierVal);
}

function openProfileModal(mode, profileIdx = null, overrideBlockId = null, prefillItem = null) {
    const targetId = overrideBlockId || selectedBlockId;
    if (!targetId) {
        showToast("먼저 품목을 관리할 랙을 선택해주세요.");
        return;
    }
    const data = factoryBlocksData.find(b => b.id === targetId);
    if (!data) return;

    profileModalMode = mode;
    editingProfileIndex = profileIdx;
    modalOriginalBlockId = data.id;
    modalTargetBlockId = data.id;

    const modal = document.getElementById('profile-modal');
    const titleEl = document.getElementById('profile-modal-title');

    if (mode === 'edit' && profileIdx !== null && data.profiles[profileIdx]) {
        const item = data.profiles[profileIdx];
        titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square text-sky-400"></i> 프로파일 품목 수정`;
        populateProfileRackAndTierSelects(data.id, item.tier || 1);
        document.getElementById('profile-form-layer').value = item.layer || `${item.tier || 1}단`;
        document.getElementById('profile-form-code').value = item.code || '';
        document.getElementById('profile-form-material').value = item.material || 'A6063-T5';
        document.getElementById('profile-form-name').value = item.name || '';
        document.getElementById('profile-form-length').value = getProfileLength(item);
        document.getElementById('profile-form-color').value = getProfileColor(item);
        document.getElementById('profile-form-qty').value = item.qty ?? 0;
        document.getElementById('profile-form-minqty').value = item.minQty ?? 0;
    } else {
        const defaultTier = (!overrideBlockId && selectedTier) ? selectedTier : 1;
        titleEl.innerHTML = prefillItem
            ? `<i class="fa-solid fa-code-branch text-sky-400"></i> [${prefillItem.code}] 타 구역 추가 입고`
            : `<i class="fa-solid fa-box-open text-sky-400"></i> 새 프로파일 품목 추가`;
        populateProfileRackAndTierSelects(data.id, defaultTier);
        document.getElementById('profile-form-layer').value = formatTier(defaultTier);
        document.getElementById('profile-form-code').value = prefillItem ? (prefillItem.code || '') : '';
        document.getElementById('profile-form-material').value = prefillItem ? (prefillItem.material || 'A6063-T5') : 'A6063-T5';
        document.getElementById('profile-form-name').value = prefillItem ? (prefillItem.name || '') : '';
        document.getElementById('profile-form-length').value = prefillItem ? (getProfileLength(prefillItem) || '6000mm') : '6000mm';
        document.getElementById('profile-form-color').value = prefillItem ? (getProfileColor(prefillItem) || '실버') : '실버';
        document.getElementById('profile-form-qty').value = 100;
        document.getElementById('profile-form-minqty').value = prefillItem ? (prefillItem.minQty ?? 30) : 30;
    }

    modal.classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

function saveProfileModal() {
    const targetRackId = document.getElementById('profile-form-rack').value || modalTargetBlockId || selectedBlockId;
    const targetData = factoryBlocksData.find(b => b.id === targetRackId);
    const origData = factoryBlocksData.find(b => b.id === (modalOriginalBlockId || targetRackId));
    if (!targetData) return;

    const tier = parseInt(document.getElementById('profile-form-tier').value) || 1;
    const layer = document.getElementById('profile-form-layer').value.trim() || `${tier}단`;
    const code = document.getElementById('profile-form-code').value.trim();
    const material = document.getElementById('profile-form-material').value.trim() || 'A6063-T5';
    const name = document.getElementById('profile-form-name').value.trim();
    const length = document.getElementById('profile-form-length').value.trim() || '-';
    const color = document.getElementById('profile-form-color').value.trim() || '-';
    const qty = Math.max(0, parseInt(document.getElementById('profile-form-qty').value) || 0);
    const minQty = Math.max(0, parseInt(document.getElementById('profile-form-minqty').value) || 0);

    if (!code || !name) {
        showToast("프로파일 코드와 품목명을 모두 입력해주세요.");
        return;
    }

    const profileObj = { tier, code, name, length, color, qty, minQty, layer, material };

    if (profileModalMode === 'edit' && origData && editingProfileIndex !== null && origData.profiles[editingProfileIndex]) {
        if (origData.id === targetData.id) {
            targetData.profiles[editingProfileIndex] = profileObj;
        } else {
            origData.profiles.splice(editingProfileIndex, 1);
            targetData.profiles.push(profileObj);
            recalculateBlockStatus(origData);
        }
        showToast(`품목 [${code}] 정보가 수정되었습니다.`);
    } else {
        targetData.profiles.push(profileObj);
        expandedInventoryCodes.add(code.toUpperCase());
        showToast(`품목 [${code}]이(가) ${targetData.codeLabel} (${tier}단)에 추가되었습니다.`);
    }

    recalculateBlockStatus(targetData);
    saveFactoryData();
    closeProfileModal();

    const activeBlock = factoryBlocksData.find(b => b.id === selectedBlockId);
    if (activeBlock) renderSidePanel(activeBlock, selectedTier);
    updateInventoryNavBadge();
    if (currentPage === 'inventory') {
        previewProfileOn3D(code.toUpperCase(), targetData.id, (targetData.tiers || 1) > 1 ? tier : null);
        renderInventoryPage();
    } else {
        applySelectionHighlight(selectedBlockId, selectedTier);
    }
}

function deleteProfileItem(profileIdx, overrideBlockId = null) {
    const targetId = overrideBlockId || selectedBlockId;
    if (!targetId) return;
    const data = factoryBlocksData.find(b => b.id === targetId);
    if (!data || !data.profiles[profileIdx]) return;

    const targetItem = data.profiles[profileIdx];
    openConfirmModal(
        "품목 삭제 확인",
        `[${data.codeLabel}]에서 [${targetItem.code}] '${targetItem.name}' 품목을 삭제하시겠습니까?`,
        () => {
            data.profiles.splice(profileIdx, 1);
            if (targetId === selectedBlockId) {
                selectedProfileIndex = null;
            }
            recalculateBlockStatus(data);
            saveFactoryData();

            const activeBlock = factoryBlocksData.find(b => b.id === selectedBlockId);
            if (activeBlock) renderSidePanel(activeBlock, selectedTier);
            updateInventoryNavBadge();
            if (currentPage === 'inventory') {
                const codeKey = (targetItem.code || '').trim().toUpperCase();
                const stillExists = getGroupedInventoryData().find(g => g.key === codeKey);
                if (stillExists) {
                    previewProfileOn3D(codeKey);
                } else if (previewFocusLocation && previewFocusLocation.blockId) {
                    previewSingleRackInInventory(previewFocusLocation.blockId, previewFocusLocation.tier ?? null);
                }
                renderInventoryPage();
            } else {
                applySelectionHighlight(selectedBlockId, selectedTier);
            }
            showToast(`품목 [${targetItem.code}]이(가) 삭제되었습니다.`);
        }
    );
}

/**
 * 7-2. 전체 프로파일 인벤토리 통합 관리 페이지 로직 (테이블 + 우측 3D 위치 미리보기)
 */
function switchPage(page) {
    currentPage = page;
    const mapPage = document.getElementById('map-page');
    const invPage = document.getElementById('inventory-page');
    const mapControls = document.getElementById('map-header-controls');
    const navMapBtn = document.getElementById('nav-map-btn');
    const navInvBtn = document.getElementById('nav-inv-btn');
    const subtitle = document.getElementById('header-subtitle');
    const canvasContainer = document.getElementById('canvas-container');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const invHost = document.getElementById('inv-3d-host');

    if (page === 'inventory') {
        if (isEditMode) toggleEditMode();
        mapPage.classList.add('hidden');
        invPage.classList.remove('hidden');
        mapControls.classList.add('hidden');

        // Live Three.js 캔버스를 인벤토리 3D 프리뷰 호스트로 이동
        if (canvasContainer && invHost && canvasContainer.parentElement !== invHost) {
            invHost.appendChild(canvasContainer);
        }

        navInvBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500 text-slate-950 transition flex items-center gap-1.5 shadow';
        navMapBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5';
        subtitle.textContent = t('sub_inv');
        window.location.hash = 'inventory';
        renderInventoryPage();

        setTimeout(() => {
            onWindowResize();
            if (previewedProfileKey) {
                previewProfileOn3D(previewedProfileKey, previewFocusLocation?.blockId || null, previewFocusLocation?.tier ?? null);
            } else {
                const firstGroup = getGroupedInventoryData()[0];
                if (firstGroup) {
                    previewProfileOn3D(firstGroup.key);
                } else {
                    resetPreviewCamera();
                }
            }
        }, 60);
    } else {
        invPage.classList.add('hidden');
        mapPage.classList.remove('hidden');
        mapControls.classList.remove('hidden');

        // Live Three.js 캔버스를 3D 지도 메인 뷰포트로 복원
        if (canvasContainer && canvasWrapper && canvasContainer.parentElement !== canvasWrapper) {
            canvasWrapper.insertBefore(canvasContainer, canvasWrapper.firstChild);
        }

        navMapBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500 text-slate-950 transition flex items-center gap-1.5 shadow';
        navInvBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5';
        subtitle.textContent = t('sub_map');
        window.location.hash = 'map';

        setTimeout(() => {
            onWindowResize();
            applySelectionHighlight(selectedBlockId, selectedTier);
            const activeBlock = factoryBlocksData.find(b => b.id === selectedBlockId);
            if (activeBlock) renderSidePanel(activeBlock, selectedTier);
        }, 60);
    }
}

function setInventorySort(key) {
    if (invSortKey === key) {
        invSortDir = (invSortDir === 'asc') ? 'desc' : 'asc';
    } else {
        invSortKey = key;
        invSortDir = (key === 'totalQty') ? 'desc' : 'asc';
    }
    renderInventoryPage();
}

function updateInventorySortIndicators() {
    const keys = ['code', 'name', 'length', 'color', 'totalQty'];
    keys.forEach(k => {
        const el = document.getElementById(`sort-ind-${k}`);
        if (!el) return;
        el.textContent = (k === invSortKey) ? (invSortDir === 'asc' ? '▲' : '▼') : '';
    });
}

function getGroupedInventoryData() {
    const groupsMap = new Map();

    factoryBlocksData.forEach(block => {
        (block.profiles || []).forEach((profile, profileIdx) => {
            const normKey = (profile.code || 'UNKNOWN').trim().toUpperCase();
            if (!groupsMap.has(normKey)) {
                groupsMap.set(normKey, {
                    key: normKey,
                    code: profile.code,
                    name: profile.name,
                    length: getProfileLength(profile) || '-',
                    color: getProfileColor(profile) || '-',
                    material: profile.material || '-',
                    totalQty: 0,
                    hasLow: false,
                    locations: []
                });
            }
            const grp = groupsMap.get(normKey);
            const qty = Number(profile.qty) || 0;
            const minQty = Number(profile.minQty) || 0;
            const isLow = qty <= minQty;

            grp.totalQty += qty;
            if (isLow) grp.hasLow = true;
            grp.locations.push({
                blockId: block.id,
                codeLabel: block.codeLabel,
                fac: block.fac,
                floor: block.floor,
                tiers: block.tiers || 1,
                profileIdx,
                profile,
                tier: profile.tier || 1,
                layer: profile.layer || `${profile.tier || 1}단`,
                length: getProfileLength(profile) || '-',
                color: getProfileColor(profile) || '-',
                qty,
                minQty,
                isLow
            });
        });
    });

    const list = Array.from(groupsMap.values());
    const dir = invSortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
        if (invSortKey === 'totalQty') {
            return (a.totalQty - b.totalQty) * dir;
        }
        const va = String(a[invSortKey] || '');
        const vb = String(b[invSortKey] || '');
        const cmp = va.localeCompare(vb, 'ko', { numeric: true, sensitivity: 'base' });
        if (cmp !== 0) return cmp * dir;
        return a.code.localeCompare(b.code, 'ko', { numeric: true });
    });
    return list;
}

function updateInventoryNavBadge() {
    const groups = getGroupedInventoryData();
    const badge = document.getElementById('nav-inv-count');
    if (badge) badge.textContent = groups.length;
}

function setInvQuickFilter(mode) {
    invQuickFilter = mode;
    const chips = {
        all: document.getElementById('inv-chip-all'),
        multi: document.getElementById('inv-chip-multi'),
        low: document.getElementById('inv-chip-low')
    };
    Object.entries(chips).forEach(([key, el]) => {
        if (!el) return;
        if (key === mode) {
            el.className = 'px-2.5 py-1 rounded-lg font-bold bg-sky-500 text-slate-950 transition';
        } else {
            el.className = 'px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white transition';
        }
    });
    renderInventoryPage();
}

function toggleInventoryGroup(normKey) {
    if (expandedInventoryCodes.has(normKey)) {
        expandedInventoryCodes.delete(normKey);
    } else {
        expandedInventoryCodes.add(normKey);
    }
    previewProfileOn3D(normKey);
    renderInventoryPage();
}

function toggleAllInventoryGroups(expand) {
    const groups = getGroupedInventoryData();
    if (expand) {
        groups.forEach(g => expandedInventoryCodes.add(g.key));
    } else {
        expandedInventoryCodes.clear();
    }
    renderInventoryPage();
}

function highlightMultipleTargetsOn3D(targets) {
    // targets: Array of { blockId, tier (nullable) }
    const targetMap = new Map();
    let needsGround = false;
    let needsMezzanine = false;

    targets.forEach(t => {
        const block = factoryBlocksData.find(b => b.id === t.blockId);
        if (!block) return;
        if (block.floor === 'GROUND') needsGround = true;
        if (block.floor === 'MEZZANINE') needsMezzanine = true;

        if (!targetMap.has(t.blockId)) targetMap.set(t.blockId, new Set());
        if (t.tier !== null && t.tier !== undefined && (block.tiers || 1) > 1) {
            targetMap.get(t.blockId).add(t.tier);
        }
    });

    if (needsGround && floorGroups.GROUND) floorGroups.GROUND.visible = true;
    if (needsMezzanine && floorGroups.MEZZANINE) floorGroups.MEZZANINE.visible = true;

    interactiveMeshes.forEach(mesh => {
        const bData = mesh.userData.blockData;
        const mTier = mesh.userData.tier;
        const tierSet = targetMap.get(bData.id);

        if (tierSet) {
            if (tierSet.size > 0 && (bData.tiers || 1) > 1) {
                if (tierSet.has(mTier)) {
                    mesh.material.color.setHex(COLORS.selected);
                    mesh.material.emissive.setHex(COLORS.selected);
                    mesh.material.emissiveIntensity = 0.6;
                } else {
                    mesh.material.color.setHex(0xfca5a5);
                    mesh.material.emissive.setHex(COLORS.selected);
                    mesh.material.emissiveIntensity = 0.14;
                }
            } else {
                mesh.material.color.setHex(COLORS.selected);
                mesh.material.emissive.setHex(COLORS.selected);
                mesh.material.emissiveIntensity = 0.5;
            }
        } else {
            const isEvenTier = (bData.tiers || 1) > 1 && mTier % 2 === 0;
            const origColor = bData.status === 'warning' ? COLORS.warning : (isEvenTier ? 0x7c8ea6 : COLORS.normal);
            mesh.material.color.setHex(origColor);
            mesh.material.emissive.setHex(0x000000);
            mesh.material.emissiveIntensity = 0;
        }
    });
}

function focusCameraOnTargets(targets) {
    const blocks = targets
        .map(t => factoryBlocksData.find(b => b.id === t.blockId))
        .filter(Boolean);
    if (blocks.length === 0) return;

    const isInvPreview = currentPage === 'inventory';
    const aspect = (camera && camera.aspect) ? camera.aspect : 1;
    const aspectBoost = (isInvPreview && aspect < 1) ? Math.min(1.6, 1 / Math.max(0.58, aspect)) : 1;
    const facCenterMap = { 'Fac C': -18.5, 'Fac A': -1.5, 'Fac B': 17.5 };

    if (blocks.length === 1) {
        const b = blocks[0];
        if (isInvPreview) {
            // 인벤토리 우측 3D 프리뷰에서는 동 전체와 주변 랙이 한눈에 들어오도록 줌아웃
            const lookX = (b.fac && facCenterMap[b.fac] !== undefined) ? facCenterMap[b.fac] : b.pos.x;
            const lookZ = 6;
            const dy = 24 * aspectBoost;
            const dz = 28 * aspectBoost;
            targetCameraPos = new THREE.Vector3(lookX, b.pos.y + dy, lookZ + dz);
            targetControlsLookAt = new THREE.Vector3(lookX, b.pos.y + 1, lookZ);
        } else {
            targetCameraPos = new THREE.Vector3(b.pos.x, b.pos.y + 18, b.pos.z + 20);
            targetControlsLookAt = new THREE.Vector3(b.pos.x, b.pos.y + 1, b.pos.z);
        }
        return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    blocks.forEach(b => {
        minX = Math.min(minX, b.pos.x);
        maxX = Math.max(maxX, b.pos.x);
        minY = Math.min(minY, b.pos.y);
        maxY = Math.max(maxY, b.pos.y);
        minZ = Math.min(minZ, b.pos.z);
        maxZ = Math.max(maxZ, b.pos.z);
    });

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    const span = Math.max(maxX - minX, maxZ - minZ, 14);
    const dist = Math.min(72, Math.max(32, span * 1.35 * aspectBoost));

    targetCameraPos = new THREE.Vector3(cx, cy + dist * 0.88, cz + dist);
    targetControlsLookAt = new THREE.Vector3(cx, cy + 1, cz);
}

function previewProfileOn3D(normKey, focusBlockId = null, focusTier = null) {
    const grp = getGroupedInventoryData().find(g => g.key === normKey);
    if (!grp) return;

    previewedProfileKey = normKey;
    const allTargets = grp.locations.map(l => ({
        blockId: l.blockId,
        tier: l.tiers > 1 ? l.tier : null
    }));

    if (focusBlockId) {
        previewFocusLocation = { blockId: focusBlockId, tier: focusTier };
        highlightMultipleTargetsOn3D([{ blockId: focusBlockId, tier: focusTier }]);
        focusCameraOnTargets([{ blockId: focusBlockId, tier: focusTier }]);
        const block = factoryBlocksData.find(b => b.id === focusBlockId);
        const tierTxt = focusTier ? ` · ${formatTier(focusTier)}` : '';
        document.getElementById('inv-preview-badge').textContent = `${grp.code} @ ${block ? block.codeLabel : focusBlockId}${tierTxt}`;
    } else {
        previewFocusLocation = allTargets[0] || null;
        highlightMultipleTargetsOn3D(allTargets);
        focusCameraOnTargets(allTargets);
        document.getElementById('inv-preview-badge').textContent = `${grp.code} · ${grp.locations.length}${t('unit_locs')}`;
    }

    document.getElementById('inv-preview-sub').textContent = `${grp.name} (${t('lbl_length')} ${grp.length} · ${t('lbl_color')} ${grp.color})`;

    const locsBar = document.getElementById('inv-preview-locs');
    locsBar.innerHTML = grp.locations.map(l => {
        const tVal = l.tiers > 1 ? l.tier : null;
        const tText = tVal ? ` · ${formatTier(tVal)}` : '';
        const isFocused = focusBlockId === l.blockId && (tVal === null || focusTier === tVal);
        return `
            <button onclick="previewProfileOn3D('${grp.key}', '${l.blockId}', ${tVal === null ? 'null' : tVal})"
                class="px-2 py-0.5 rounded-md text-[10px] font-mono border transition ${
                    isFocused
                        ? 'bg-rose-500/25 border-rose-400 text-rose-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-400 hover:text-sky-300'
                }">
                ${l.codeLabel}${tText} (${l.qty.toLocaleString()})
            </button>
        `;
    }).join('');

    if (grp.locations.length > 1) {
        const allBtn = document.createElement('button');
        allBtn.textContent = t('all_locations_btn');
        allBtn.className = !focusBlockId
            ? 'px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/25 border border-sky-400 text-sky-200'
            : 'px-2 py-0.5 rounded-md text-[10px] bg-slate-800 border border-slate-700 text-slate-300 hover:text-white';
        allBtn.onclick = () => previewProfileOn3D(grp.key, null, null);
        locsBar.prepend(allBtn);
    }
}

function previewSingleRackInInventory(blockId, tier = null) {
    const block = factoryBlocksData.find(b => b.id === blockId);
    if (!block) return;
    previewFocusLocation = { blockId, tier };
    highlightMultipleTargetsOn3D([{ blockId, tier }]);
    focusCameraOnTargets([{ blockId, tier }]);
    const tierTxt = tier ? ` · ${formatTier(tier)}` : '';
    document.getElementById('inv-preview-badge').textContent = `${block.codeLabel}${tierTxt}`;
    document.getElementById('inv-preview-sub').textContent = `${block.name} (${block.profiles.length} ${t('unit_types')})`;
    document.getElementById('inv-preview-locs').innerHTML = '';
}

function resetPreviewCamera() {
    targetCameraPos = new THREE.Vector3(0, 38, 44);
    targetControlsLookAt = new THREE.Vector3(0, 1, 5);
}

function openPreviewInFullMap() {
    if (previewFocusLocation && previewFocusLocation.blockId) {
        jumpToLocationFromInventory(previewFocusLocation.blockId, previewFocusLocation.tier ?? null);
    } else {
        switchPage('map');
    }
}

function renderInventoryPage() {
    updateInventoryNavBadge();
    updateInventorySortIndicators();
    const allGroups = getGroupedInventoryData();

    // 전체 KPI 갱신
    let totalFactoryQty = 0;
    let multiLocationCount = 0;
    let lowLocationCount = 0;
    allGroups.forEach(g => {
        totalFactoryQty += g.totalQty;
        if (g.locations.length > 1) multiLocationCount++;
        g.locations.forEach(loc => { if (loc.isLow) lowLocationCount++; });
    });

    document.getElementById('inv-kpi-types').textContent = `${allGroups.length} ${t('unit_types')}`;
    document.getElementById('inv-kpi-multi').textContent = `${multiLocationCount} ${t('unit_types')}`;
    document.getElementById('inv-kpi-qty').textContent = `${totalFactoryQty.toLocaleString()} EA`;
    document.getElementById('inv-kpi-low').textContent = `${lowLocationCount} ${t('unit_cases')}`;

    const query = (document.getElementById('inv-search-input').value || '').trim().toUpperCase();
    const facFilter = document.getElementById('inv-filter-fac').value;
    const floorFilter = document.getElementById('inv-filter-floor').value;

    const filteredGroups = allGroups.map(grp => {
        const matchingLocs = grp.locations.filter(loc => {
            if (facFilter !== 'ALL' && loc.fac !== facFilter) return false;
            if (floorFilter !== 'ALL' && loc.floor !== floorFilter) return false;
            return true;
        });

        if (matchingLocs.length === 0) return null;
        if (invQuickFilter === 'multi' && grp.locations.length < 2) return null;
        if (invQuickFilter === 'low' && !matchingLocs.some(l => l.isLow)) return null;

        if (query) {
            const groupMatch =
                grp.code.toUpperCase().includes(query) ||
                grp.name.toUpperCase().includes(query) ||
                grp.length.toUpperCase().includes(query) ||
                grp.color.toUpperCase().includes(query);
            const locMatch = matchingLocs.some(loc =>
                loc.codeLabel.toUpperCase().includes(query) ||
                loc.layer.toUpperCase().includes(query)
            );
            if (!groupMatch && !locMatch) return null;
        }

        const filteredTotalQty = matchingLocs.reduce((sum, l) => sum + l.qty, 0);
        return {
            ...grp,
            filteredLocations: matchingLocs,
            filteredTotalQty
        };
    }).filter(Boolean);

    const tbody = document.getElementById('inv-table-body');
    tbody.innerHTML = '';

    if (filteredGroups.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-16 text-center text-slate-400 text-sm">
                    <i class="fa-solid fa-box-open text-3xl text-slate-600 mb-3 block"></i>
                    ${currentLang === 'en' ? 'No matching profile items found.' : '조건에 일치하는 프로파일 재고 항목이 없습니다.'}
                </td>
            </tr>
        `;
        return;
    }

    filteredGroups.forEach(grp => {
        const isMulti = grp.locations.length > 1;
        const isExpanded = expandedInventoryCodes.has(grp.key) || Boolean(query);
        const isPreviewed = previewedProfileKey === grp.key;

        const mainTr = document.createElement('tr');
        mainTr.className = `cursor-pointer transition ${
            isPreviewed
                ? 'bg-sky-500/10 hover:bg-sky-500/15'
                : 'hover:bg-slate-900/80'
        }`;
        mainTr.onclick = () => toggleInventoryGroup(grp.key);

        const locationChipsHtml = grp.filteredLocations.map(loc => {
            const tVal = loc.tiers > 1 ? loc.tier : null;
            const tText = tVal ? ` · ${formatTier(tVal)}` : '';
            const isChipFocused = isPreviewed && previewFocusLocation && previewFocusLocation.blockId === loc.blockId && (tVal === null || previewFocusLocation.tier === tVal);
            return `
                <button onclick="event.stopPropagation(); previewProfileOn3D('${grp.key}', '${loc.blockId}', ${tVal === null ? 'null' : tVal}); renderInventoryPage();"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition border ${
                        isChipFocused
                            ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                            : (loc.isLow
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                                : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-sky-400 hover:text-sky-300')
                    }">
                    <i class="fa-solid fa-location-dot text-[9px] text-sky-400"></i>
                    <span class="font-mono font-bold">${loc.codeLabel}${tText}</span>
                    <span class="text-slate-400">(${loc.qty.toLocaleString()})</span>
                </button>
            `;
        }).join('');

        mainTr.innerHTML = `
            <td class="py-2.5 pl-4 pr-2 align-middle whitespace-nowrap">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-chevron-${isExpanded ? 'down' : 'right'} text-slate-500 text-[10px] w-2.5"></i>
                    <span class="font-mono font-bold text-sky-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md text-[11px]">${grp.code}</span>
                    ${isMulti ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${grp.locations.length}${t('unit_locs')}</span>` : ''}
                </div>
            </td>
            <td class="py-2.5 px-2 align-middle font-semibold text-slate-100">
                <div class="truncate max-w-[260px]" title="${grp.name}">${grp.name}</div>
            </td>
            <td class="py-2.5 px-2 align-middle whitespace-nowrap text-slate-300 font-mono">${grp.length}</td>
            <td class="py-2.5 px-2 align-middle whitespace-nowrap text-slate-300">${grp.color}</td>
            <td class="py-2.5 px-2 align-middle">
                <div class="flex flex-wrap items-center gap-1">${locationChipsHtml}</div>
            </td>
            <td class="py-2.5 px-2 align-middle text-right whitespace-nowrap">
                <strong class="font-mono text-sm font-bold ${grp.hasLow ? 'text-amber-400' : 'text-emerald-400'}">${grp.filteredTotalQty.toLocaleString()}</strong>
                <span class="text-[10px] text-slate-400">EA</span>
            </td>
            <td class="py-2.5 pl-2 pr-4 align-middle text-right whitespace-nowrap">
                <div class="inline-flex items-center gap-1">
                    <button onclick="event.stopPropagation(); previewProfileOn3D('${grp.key}'); renderInventoryPage();" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-400 text-sky-300 text-[11px] font-medium transition">
                        <i class="fa-solid fa-crosshairs"></i>
                    </button>
                    <button onclick="event.stopPropagation(); openInventoryAddLocationForCode('${grp.key}')" class="px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[11px] font-bold transition">
                        <i class="fa-solid fa-plus"></i> ${t('btn_stock_in')}
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(mainTr);

        if (isExpanded) {
            grp.filteredLocations.forEach(loc => {
                const floorLabel = loc.floor === 'MEZZANINE' ? '2F' : '1F';
                const tierBadge = loc.tiers > 1 ? formatTier(loc.tier) : (currentLang === 'en' ? formatTier(loc.tier || 1) : loc.layer);
                const tVal = loc.tiers > 1 ? loc.tier : null;

                const subTr = document.createElement('tr');
                subTr.className = 'bg-slate-900/40 hover:bg-slate-900/80 text-[11px] transition';
                subTr.innerHTML = `
                    <td class="py-2 pl-9 pr-2 align-middle whitespace-nowrap text-slate-400">
                        <span class="inline-flex items-center gap-1 text-slate-400">
                            <i class="fa-solid fa-turn-up fa-rotate-90 text-[9px] text-slate-600"></i>
                            ${loc.fac} · ${floorLabel}
                        </span>
                    </td>
                    <td class="py-2 px-2 align-middle whitespace-nowrap">
                        <div class="inline-flex items-center gap-1.5">
                            <button onclick="previewProfileOn3D('${grp.key}', '${loc.blockId}', ${tVal === null ? 'null' : tVal}); renderInventoryPage();"
                                class="px-2 py-0.5 rounded bg-slate-800 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-400 text-sky-300 font-mono font-bold transition">
                                ${loc.codeLabel}
                            </button>
                            <span class="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">${tierBadge}</span>
                        </div>
                    </td>
                    <td class="py-2 px-2 align-middle whitespace-nowrap text-slate-300 font-mono">${loc.length}</td>
                    <td class="py-2 px-2 align-middle whitespace-nowrap text-slate-300">${loc.color}</td>
                    <td class="py-2 px-2 align-middle">
                        <div class="inline-flex items-center gap-1">
                            <button onclick="invAdjustQty('${loc.blockId}', ${loc.profileIdx}, -10)" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300">-10</button>
                            <button onclick="invAdjustQty('${loc.blockId}', ${loc.profileIdx}, -1)" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300">-1</button>
                            <button onclick="invAdjustQty('${loc.blockId}', ${loc.profileIdx}, 1)" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300">+1</button>
                            <button onclick="invAdjustQty('${loc.blockId}', ${loc.profileIdx}, 10)" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300">+10</button>
                        </div>
                    </td>
                    <td class="py-2 px-2 align-middle text-right whitespace-nowrap">
                        <span class="font-mono font-bold ${loc.isLow ? 'text-amber-400' : 'text-emerald-400'}">${loc.qty.toLocaleString()}</span>
                        <span class="text-[10px] text-slate-500">EA</span>
                    </td>
                    <td class="py-2 pl-2 pr-4 align-middle text-right whitespace-nowrap">
                        <div class="inline-flex items-center gap-1">
                            <button onclick="openMoveProfileModal('${loc.blockId}', ${loc.profileIdx})" class="px-2 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition">
                                ${t('btn_move')}
                            </button>
                            <button onclick="openProfileModal('edit', ${loc.profileIdx}, '${loc.blockId}')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
                                ${t('btn_edit')}
                            </button>
                            <button onclick="deleteProfileItem(${loc.profileIdx}, '${loc.blockId}')" class="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(subTr);
            });
        }
    });
}

function jumpToLocationFromInventory(blockId, tier = null) {
    switchPage('map');
    setTimeout(() => {
        selectBlock(blockId, true, tier);
        const data = factoryBlocksData.find(b => b.id === blockId);
        if (data) {
            const tierText = tier ? ` (${formatTier(tier)})` : '';
            showToast(currentLang === 'en'
                ? `Moved to [${data.codeLabel}${tierText}]`
                : `[${data.codeLabel}${tierText}] 구역으로 이동했습니다.`);
        }
    }, 80);
}

function openInventoryAddModal() {
    const defaultRack = selectedBlockId || (factoryBlocksData[0] && factoryBlocksData[0].id);
    if (!defaultRack) {
        showToast("먼저 랙을 생성해주세요.");
        return;
    }
    openProfileModal('add', null, defaultRack, null);
}

function openInventoryAddLocationForCode(normKey) {
    const grp = getGroupedInventoryData().find(g => g.key === normKey);
    if (!grp || grp.locations.length === 0) return;
    const sampleLoc = grp.locations[0];
    // 현재 보관되지 않은 다른 랙이 있으면 우선 제안
    const usedRackIds = new Set(grp.locations.map(l => l.blockId));
    const unusedRack = factoryBlocksData.find(b => !usedRackIds.has(b.id));
    const targetRackId = unusedRack ? unusedRack.id : sampleLoc.blockId;

    openProfileModal('add', null, targetRackId, sampleLoc.profile);
}

function invAdjustQty(blockId, profileIdx, delta) {
    const data = factoryBlocksData.find(b => b.id === blockId);
    if (!data || !data.profiles[profileIdx]) return;
    const item = data.profiles[profileIdx];
    item.qty = Math.max(0, (Number(item.qty) || 0) + delta);
    recalculateBlockStatus(data);
    saveFactoryData();
    const normKey = (item.code || '').trim().toUpperCase();
    previewProfileOn3D(normKey, blockId, (data.tiers || 1) > 1 ? (item.tier || 1) : null);
    renderInventoryPage();
}

function openMoveProfileModal(blockId, profileIdx) {
    const sourceData = factoryBlocksData.find(b => b.id === blockId);
    if (!sourceData || !sourceData.profiles[profileIdx]) return;
    const item = sourceData.profiles[profileIdx];

    moveSource = { blockId, profileIdx };
    const tierLabel = sourceData.tiers > 1 ? formatTier(item.tier || 1) : (currentLang === 'en' ? formatTier(item.tier || 1) : (item.layer || '1단'));
    document.getElementById('move-item-code').textContent = item.code;
    document.getElementById('move-item-source').textContent = currentLang === 'en'
        ? `Current: ${sourceData.codeLabel} · ${tierLabel} (${item.qty} EA)`
        : `현재 위치: ${sourceData.codeLabel} · ${tierLabel} (보유 ${item.qty} EA)`;
    document.getElementById('move-item-name').textContent = item.name;
    document.getElementById('move-qty').value = item.qty;
    document.getElementById('move-qty').max = item.qty;

    const rackSelect = document.getElementById('move-target-rack');
    rackSelect.innerHTML = '';
    factoryBlocksData.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.codeLabel} (${b.fac} · ${b.floor === 'MEZZANINE' ? '2F' : '1F'})`;
        rackSelect.appendChild(opt);
    });
    const otherRack = factoryBlocksData.find(b => b.id !== blockId);
    rackSelect.value = otherRack ? otherRack.id : blockId;
    onMoveTargetRackChange();

    document.getElementById('move-profile-modal').classList.remove('hidden');
}

function closeMoveProfileModal() {
    document.getElementById('move-profile-modal').classList.add('hidden');
    moveSource = null;
}

function onMoveTargetRackChange() {
    const rackId = document.getElementById('move-target-rack').value;
    const rackData = factoryBlocksData.find(b => b.id === rackId);
    const tierSelect = document.getElementById('move-target-tier');
    const tierCount = rackData ? (rackData.tiers || 1) : 1;
    tierSelect.innerHTML = '';
    for (let t = 1; t <= tierCount; t++) {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = formatTier(t);
        tierSelect.appendChild(opt);
    }
}

function setMoveMaxQty() {
    if (!moveSource) return;
    const sourceData = factoryBlocksData.find(b => b.id === moveSource.blockId);
    if (!sourceData || !sourceData.profiles[moveSource.profileIdx]) return;
    document.getElementById('move-qty').value = sourceData.profiles[moveSource.profileIdx].qty;
}

function confirmMoveProfile() {
    if (!moveSource) return;
    const sourceData = factoryBlocksData.find(b => b.id === moveSource.blockId);
    const item = sourceData && sourceData.profiles[moveSource.profileIdx];
    if (!sourceData || !item) return;

    const targetRackId = document.getElementById('move-target-rack').value;
    const targetTier = parseInt(document.getElementById('move-target-tier').value) || 1;
    const targetData = factoryBlocksData.find(b => b.id === targetRackId);
    if (!targetData) return;

    const moveQty = parseInt(document.getElementById('move-qty').value) || 0;
    const currentQty = Number(item.qty) || 0;
    if (moveQty <= 0 || moveQty > currentQty) {
        showToast(`이동 수량은 1 ~ ${currentQty} EA 사이로 입력해주세요.`);
        return;
    }

    if (sourceData.id === targetData.id && (item.tier || 1) === targetTier) {
        showToast("현재 위치와 동일한 랙/단입니다. 다른 위치를 선택해주세요.");
        return;
    }

    // 대상 랙/단에 동일 코드 품목이 이미 있으면 수량 합산, 없으면 새 항목 생성
    const existingTarget = targetData.profiles.find(p =>
        (p.code || '').trim().toUpperCase() === (item.code || '').trim().toUpperCase() &&
        (p.tier || 1) === targetTier
    );

    if (existingTarget) {
        existingTarget.qty = (Number(existingTarget.qty) || 0) + moveQty;
    } else {
        const cloned = JSON.parse(JSON.stringify(item));
        cloned.tier = targetTier;
        cloned.layer = `${targetTier}단`;
        cloned.qty = moveQty;
        targetData.profiles.push(cloned);
    }

    if (moveQty >= currentQty) {
        sourceData.profiles.splice(moveSource.profileIdx, 1);
    } else {
        item.qty = currentQty - moveQty;
    }

    recalculateBlockStatus(sourceData);
    recalculateBlockStatus(targetData);
    const movedKey = (item.code || '').trim().toUpperCase();
    expandedInventoryCodes.add(movedKey);
    saveFactoryData();
    closeMoveProfileModal();

    const activeBlock = factoryBlocksData.find(b => b.id === selectedBlockId);
    if (activeBlock) renderSidePanel(activeBlock, selectedTier);
    previewProfileOn3D(movedKey, targetData.id, (targetData.tiers || 1) > 1 ? targetTier : null);
    renderInventoryPage();
    showToast(`[${item.code}] ${moveQty.toLocaleString()} EA를 ${targetData.codeLabel} (${targetTier}단)으로 이동했습니다.`);
}

/**
 * 7-3. Excel (.xlsx / .xls / .csv) 내보내기 / 가져오기
 */
let pendingExcelImport = null;

function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        showToast(currentLang === 'en' ? 'Excel library failed to load. Please check network.' : '엑셀 라이브러리를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.');
        return;
    }

    const inventoryRows = [];
    factoryBlocksData.forEach(block => {
        (block.profiles || []).forEach(p => {
            inventoryRows.push({
                RackCode: block.codeLabel,
                Facility: block.fac,
                Floor: block.floor === 'MEZZANINE' ? '2F' : '1F',
                Tier: p.tier || 1,
                Layer: p.layer || `${p.tier || 1}단`,
                ProfileCode: p.code || '',
                ProfileName: p.name || '',
                Length: getProfileLength(p) || '-',
                Color: getProfileColor(p) || '-',
                Material: p.material || 'A6063-T5',
                Qty: Number(p.qty) || 0,
                MinQty: Number(p.minQty) || 0
            });
        });
    });

    const rackRows = factoryBlocksData.map(b => ({
        RackCode: b.codeLabel,
        Facility: b.fac,
        Floor: b.floor === 'MEZZANINE' ? '2F' : '1F',
        Tiers: b.tiers || 1,
        Name: b.name || b.codeLabel,
        Desc: b.desc || '',
        PosX: Number(b.pos.x),
        PosY: Number(b.pos.y),
        PosZ: Number(b.pos.z),
        Width: Number(b.size.w),
        Height: Number(b.size.h),
        Depth: Number(b.size.d)
    }));

    const wb = XLSX.utils.book_new();
    const wsInv = XLSX.utils.json_to_sheet(inventoryRows.length > 0 ? inventoryRows : [{
        RackCode: '', Facility: 'Fac C', Floor: '1F', Tier: 1, Layer: '1단',
        ProfileCode: '', ProfileName: '', Length: '', Color: '', Material: 'A6063-T5', Qty: 0, MinQty: 0
    }]);
    wsInv['!cols'] = [
        { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 6 }, { wch: 12 },
        { wch: 18 }, { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(wb, wsInv, 'Inventory');

    const wsRacks = XLSX.utils.json_to_sheet(rackRows);
    wsRacks['!cols'] = [
        { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 28 }, { wch: 36 },
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }
    ];
    XLSX.utils.book_append_sheet(wb, wsRacks, 'Racks');

    const today = new Date().toISOString().slice(0, 10);
    const filename = `smart_factory_inventory_${today}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast(currentLang === 'en' ? `Exported ${inventoryRows.length} items to ${filename}` : `엑셀 파일(${filename})로 ${inventoryRows.length}건이 내보내졌습니다.`);
}

function triggerExcelImport() {
    if (typeof XLSX === 'undefined') {
        showToast(currentLang === 'en' ? 'Excel library failed to load. Please check network.' : '엑셀 라이브러리를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.');
        return;
    }
    const input = document.getElementById('excel-file-input');
    input.value = '';
    input.click();
}

function normalizeColKey(k) {
    return String(k || '').trim().toLowerCase().replace(/[\s_\-()]/g, '');
}

function pickExcelCol(row, aliases, fallback = '') {
    const entries = Object.entries(row);
    for (const alias of aliases) {
        const target = normalizeColKey(alias);
        const found = entries.find(([k]) => normalizeColKey(k) === target);
        if (found && found[1] !== undefined && found[1] !== null && String(found[1]).trim() !== '') {
            return found[1];
        }
    }
    return fallback;
}

function normalizeFloorValue(rawFloor, rackCode = '') {
    const s = String(rawFloor || '').trim().toUpperCase();
    if (s === '2F' || s === 'MEZZANINE' || s.includes('2층')) return 'MEZZANINE';
    if (s === '1F' || s === 'GROUND' || s.includes('1층')) return 'GROUND';
    if (String(rackCode).toUpperCase().includes('-2F-')) return 'MEZZANINE';
    return 'GROUND';
}

function normalizeFacValue(rawFac, rackCode = '') {
    const s = String(rawFac || '').trim().toUpperCase();
    if (s.includes('C')) return 'Fac C';
    if (s.includes('A')) return 'Fac A';
    if (s.includes('B')) return 'Fac B';
    const rc = String(rackCode).trim().toUpperCase();
    if (rc.startsWith('C-')) return 'Fac C';
    if (rc.startsWith('A-')) return 'Fac A';
    if (rc.startsWith('B-')) return 'Fac B';
    return 'Fac C';
}

function handleExcelFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: 'array' });

            const invSheetName = wb.SheetNames.find(n => ['inventory', '재고', '품목'].includes(n.trim().toLowerCase())) || wb.SheetNames[0];
            const rackSheetName = wb.SheetNames.find(n => ['racks', 'rack', '랙'].includes(n.trim().toLowerCase()) && n !== invSheetName);

            const rawInv = invSheetName ? XLSX.utils.sheet_to_json(wb.Sheets[invSheetName], { defval: '' }) : [];
            const rawRacks = rackSheetName ? XLSX.utils.sheet_to_json(wb.Sheets[rackSheetName], { defval: '' }) : [];

            const parsedInv = rawInv.map(row => {
                const rackCode = String(pickExcelCol(row, ['RackCode', 'Rack', 'RackID', '랙코드', '랙', '보관랙', '구역'], '')).trim();
                const profileCode = String(pickExcelCol(row, ['ProfileCode', 'Code', '프로파일코드', '코드', '품목코드'], '')).trim();
                const profileName = String(pickExcelCol(row, ['ProfileName', 'Name', '품목명', '프로파일명'], '')).trim();
                if (!rackCode || !profileCode) return null;

                const tierNum = Math.max(1, parseInt(pickExcelCol(row, ['Tier', '단수', '단'], 1)) || 1);
                const fac = normalizeFacValue(pickExcelCol(row, ['Facility', 'Fac', '동', '소속동'], ''), rackCode);
                const floor = normalizeFloorValue(pickExcelCol(row, ['Floor', '층', '층수'], ''), rackCode);
                const layer = String(pickExcelCol(row, ['Layer', '위치라벨', '위치'], `${tierNum}단`)).trim() || `${tierNum}단`;
                const length = String(pickExcelCol(row, ['Length', '길이', '규격'], '-')).trim() || '-';
                const color = String(pickExcelCol(row, ['Color', '색상'], '-')).trim() || '-';
                const material = String(pickExcelCol(row, ['Material', '재질'], 'A6063-T5')).trim() || 'A6063-T5';
                const qty = Math.max(0, Number(pickExcelCol(row, ['Qty', 'Quantity', '수량', '재고', '현재재고'], 0)) || 0);
                const minQty = Math.max(0, Number(pickExcelCol(row, ['MinQty', 'SafetyStock', '안전재고', '최소수량'], 0)) || 0);

                return {
                    rackCode,
                    fac,
                    floor,
                    tier: tierNum,
                    layer,
                    code: profileCode,
                    name: profileName || profileCode,
                    length,
                    color,
                    material,
                    qty,
                    minQty
                };
            }).filter(Boolean);

            const parsedRacks = rawRacks.map(row => {
                const rackCode = String(pickExcelCol(row, ['RackCode', 'Rack', 'RackID', 'ID', '랙코드', '랙'], '')).trim();
                if (!rackCode) return null;
                const fac = normalizeFacValue(pickExcelCol(row, ['Facility', 'Fac', '동'], ''), rackCode);
                const floor = normalizeFloorValue(pickExcelCol(row, ['Floor', '층'], ''), rackCode);
                const tiers = Math.min(10, Math.max(1, parseInt(pickExcelCol(row, ['Tiers', 'Tier', '단수'], 1)) || 1));
                const name = String(pickExcelCol(row, ['Name', '랙명칭', '명칭'], rackCode)).trim() || rackCode;
                const desc = String(pickExcelCol(row, ['Desc', 'Description', '상세설명', '설명'], `${fac} • ${floor === 'MEZZANINE' ? '2F' : '1F'}`)).trim();
                const x = Number(pickExcelCol(row, ['PosX', 'X', 'X좌표'], 0)) || 0;
                const y = floor === 'MEZZANINE' ? 6.5 : 0;
                const z = Number(pickExcelCol(row, ['PosZ', 'Z', 'Z좌표'], 3.5)) || 3.5;
                const w = Math.max(0.5, Number(pickExcelCol(row, ['Width', 'W', '가로'], 2.0)) || 2.0);
                const h = Math.max(0.5, Number(pickExcelCol(row, ['Height', 'H', '높이'], 2.5)) || 2.5);
                const d = Math.max(0.5, Number(pickExcelCol(row, ['Depth', 'D', '깊이'], 8.0)) || 8.0);

                return {
                    id: rackCode,
                    fac,
                    floor,
                    codeLabel: rackCode,
                    name,
                    desc,
                    pos: { x, y, z },
                    size: { w, h, d },
                    status: 'normal',
                    tiers,
                    profiles: []
                };
            }).filter(Boolean);

            if (parsedInv.length === 0 && parsedRacks.length === 0) {
                showToast(currentLang === 'en' ? 'No valid inventory rows found in Excel file.' : '엑셀 파일에서 유효한 재고 데이터를 찾지 못했습니다.');
                return;
            }

            pendingExcelImport = { inventoryRows: parsedInv, rackRows: parsedRacks };
            document.getElementById('excel-import-filename').textContent = file.name;
            document.getElementById('excel-import-summary').textContent = currentLang === 'en'
                ? `Inventory: ${parsedInv.length} rows, Racks: ${parsedRacks.length}`
                : `품목 ${parsedInv.length}건, 랙 ${parsedRacks.length}개`;
            document.getElementById('excel-import-modal').classList.remove('hidden');
        } catch (err) {
            console.error('Excel import parse error:', err);
            showToast(currentLang === 'en' ? 'Failed to read Excel file.' : '엑셀 파일을 읽는 중 오류가 발생했습니다.');
        }
    };
    reader.readAsArrayBuffer(file);
}

function closeExcelImportModal() {
    document.getElementById('excel-import-modal').classList.add('hidden');
    pendingExcelImport = null;
}

function ensureRackExistsFromImport(row) {
    let block = factoryBlocksData.find(b => b.id.toUpperCase() === row.rackCode.toUpperCase());
    if (!block) {
        const facCenterMap = { 'Fac C': -18.5, 'Fac A': -1.5, 'Fac B': 17.5 };
        const newRack = {
            id: row.rackCode,
            fac: row.fac,
            floor: row.floor,
            codeLabel: row.rackCode,
            name: `${row.rackCode}`,
            desc: `${row.fac} • ${row.floor === 'MEZZANINE' ? '2F' : '1F'}`,
            pos: { x: facCenterMap[row.fac] ?? 0, y: row.floor === 'MEZZANINE' ? 6.5 : 0, z: 3.5 },
            size: { w: 2.0, h: Math.max(2.2, row.tier * 0.7), d: 8.0 },
            status: 'normal',
            tiers: Math.min(10, Math.max(1, row.tier)),
            profiles: []
        };
        factoryBlocksData.push(newRack);
        block = newRack;
    } else if (row.tier > (block.tiers || 1)) {
        block.tiers = Math.min(10, row.tier);
    }
    return block;
}

function applyExcelImport(mode) {
    if (!pendingExcelImport) return;
    const { inventoryRows, rackRows } = pendingExcelImport;

    if (mode === 'replace') {
        if (rackRows.length > 0) {
            factoryBlocksData = JSON.parse(JSON.stringify(rackRows));
        } else {
            factoryBlocksData.forEach(b => { b.profiles = []; });
        }
        inventoryRows.forEach(row => {
            const block = ensureRackExistsFromImport(row);
            block.profiles.push({
                tier: row.tier,
                code: row.code,
                name: row.name,
                length: row.length,
                color: row.color,
                qty: row.qty,
                minQty: row.minQty,
                layer: row.layer,
                material: row.material
            });
        });
    } else {
        // merge mode
        rackRows.forEach(r => {
            const existing = factoryBlocksData.find(b => b.id.toUpperCase() === r.id.toUpperCase());
            if (!existing) {
                factoryBlocksData.push(JSON.parse(JSON.stringify(r)));
            } else {
                existing.fac = r.fac;
                existing.floor = r.floor;
                existing.tiers = Math.max(existing.tiers || 1, r.tiers || 1);
                existing.name = r.name;
                existing.desc = r.desc;
                existing.pos = r.pos;
                existing.size = r.size;
            }
        });

        inventoryRows.forEach(row => {
            const block = ensureRackExistsFromImport(row);
            const existingItem = block.profiles.find(p =>
                (p.code || '').trim().toUpperCase() === row.code.toUpperCase() &&
                (p.tier || 1) === row.tier
            );
            if (existingItem) {
                existingItem.name = row.name;
                existingItem.length = row.length;
                existingItem.color = row.color;
                existingItem.material = row.material;
                existingItem.qty = row.qty;
                existingItem.minQty = row.minQty;
                existingItem.layer = row.layer;
            } else {
                block.profiles.push({
                    tier: row.tier,
                    code: row.code,
                    name: row.name,
                    length: row.length,
                    color: row.color,
                    qty: row.qty,
                    minQty: row.minQty,
                    layer: row.layer,
                    material: row.material
                });
            }
        });
    }

    factoryBlocksData.forEach(recalculateBlockStatus);
    rebuildAllBlocks3D();
    saveFactoryData();
    closeExcelImportModal();

    if (factoryBlocksData.length > 0) {
        if (!factoryBlocksData.some(b => b.id === selectedBlockId)) {
            selectedBlockId = factoryBlocksData[0].id;
            selectedTier = null;
        }
    } else {
        selectedBlockId = null;
        selectedTier = null;
    }

    renderInventoryPage();
    const firstInv = inventoryRows[0];
    if (currentPage === 'inventory' && firstInv) {
        previewProfileOn3D(firstInv.code.toUpperCase());
    } else if (selectedBlockId) {
        selectBlock(selectedBlockId, false, selectedTier);
    }
    showToast(currentLang === 'en'
        ? `Excel import complete (${inventoryRows.length} rows).`
        : `엑셀 데이터(${inventoryRows.length}건)가 성공적으로 반영되었습니다.`);
}

// 공통 확인 모달 제어
function openConfirmModal(title, desc, onConfirm) {
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-desc').textContent = desc;
    confirmCallback = onConfirm;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    confirmCallback = null;
}

document.getElementById('confirm-modal-ok-btn').addEventListener('click', () => {
    const cb = confirmCallback;
    closeConfirmModal();
    if (typeof cb === 'function') cb();
});

/**
 * 8. 동(Fac C, A, B) 이동 및 층(Ground / Mezzanine) 필터 전환
 */
function focusZone(zone, btnEl) {
    if (btnEl) {
        document.querySelectorAll('.zone-btn').forEach(btn => {
            btn.classList.remove('bg-sky-500', 'text-white', 'font-bold');
            btn.classList.add('text-slate-300', 'font-medium');
        });
        btnEl.classList.add('bg-sky-500', 'text-white', 'font-bold');
        btnEl.classList.remove('text-slate-300', 'font-medium');
    }

    if (zone === 'ALL') {
        targetCameraPos = new THREE.Vector3(0, 38, 44);
        targetControlsLookAt = new THREE.Vector3(0, 1, 5);
    } else if (zone === 'C') {
        targetCameraPos = new THREE.Vector3(-18.5, 24, 26);
        targetControlsLookAt = new THREE.Vector3(-18.5, 1, 6);
    } else if (zone === 'A') {
        targetCameraPos = new THREE.Vector3(-1.5, 24, 26);
        targetControlsLookAt = new THREE.Vector3(-1.5, 1, 6);
    } else if (zone === 'B') {
        targetCameraPos = new THREE.Vector3(17.5, 24, 26);
        targetControlsLookAt = new THREE.Vector3(17.5, 1, 6);
    }
}

function setFloorFilter(floorMode, btnEl) {
    if (btnEl) {
        document.querySelectorAll('.floor-btn').forEach(btn => {
            btn.classList.remove('bg-indigo-500', 'text-white', 'font-bold');
            btn.classList.add('text-slate-300', 'font-medium');
        });
        btnEl.classList.add('bg-indigo-500', 'text-white', 'font-bold');
        btnEl.classList.remove('text-slate-300', 'font-medium');
    }

    if (floorMode === 'ALL') {
        floorGroups.GROUND.visible = true;
        floorGroups.MEZZANINE.visible = true;
        showToast("Ground(1층)와 Mezzanine(2층) 전체를 표시합니다.");
    } else if (floorMode === 'GROUND') {
        floorGroups.GROUND.visible = true;
        floorGroups.MEZZANINE.visible = false;
        showToast("Ground (1층) 레이아웃만 표시합니다.");
    } else if (floorMode === 'MEZZANINE') {
        floorGroups.GROUND.visible = false;
        floorGroups.MEZZANINE.visible = true;
        showToast("Mezzanine (2층 중층) 레이아웃만 표시합니다.");
    }
}

// 전체 뷰 버튼 이벤트
document.getElementById('btn-reset-cam').addEventListener('click', () => {
    targetCameraPos = new THREE.Vector3(0, 38, 44);
    targetControlsLookAt = new THREE.Vector3(0, 1, 5);
    showToast("전체 공장 뷰로 초기화되었습니다.");
});

// 프로파일 코드 검색 기능 (예: A-EXT-WA-00-01, AL-4040 등)
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim().toUpperCase();
        if (!query) return;

        const matchingBlocks = factoryBlocksData.filter(block => 
            block.codeLabel.toUpperCase().includes(query) || 
            block.profiles.some(p => p.code.toUpperCase().includes(query) || p.name.toUpperCase().includes(query))
        );

        if (matchingBlocks.length > 0) {
            const foundBlock = matchingBlocks[0];
            const matchedProfile = foundBlock.profiles.find(p => p.code.toUpperCase().includes(query) || p.name.toUpperCase().includes(query));
            const targetTier = (matchedProfile && matchedProfile.tier && (foundBlock.tiers || 1) > 1) ? matchedProfile.tier : null;
            selectBlock(foundBlock.id, true, targetTier);
            const tierInfo = targetTier ? ` (${targetTier}단)` : '';
            const extraInfo = matchingBlocks.length > 1 ? ` · 외 ${matchingBlocks.length - 1}곳 보관 중` : '';
            showToast(`'${query}' 자재 위치 [${foundBlock.codeLabel}${tierInfo}]${extraInfo}`);
        } else {
            showToast(`'${query}'에 해당하는 프로파일을 찾을 수 없습니다.`);
        }
    }
});

// 커스텀 토스트 알림
function showToast(msg) {
    const toast = document.getElementById('toast-msg');
    document.getElementById('toast-text').textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// 창 크기 변경 대응
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// 메인 렌더링 루프
function animate() {
    requestAnimationFrame(animate);

    // 부드러운 카메라 줌/이동 애니메이션
    if (targetCameraPos && targetControlsLookAt) {
        camera.position.lerp(targetCameraPos, 0.08);
        controls.target.lerp(targetControlsLookAt, 0.08);

        if (camera.position.distanceTo(targetCameraPos) < 0.2) {
            targetCameraPos = null;
            targetControlsLookAt = null;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

// 공유용 HTML 내보내기를 위한 초기 DOM 스냅샷 & 저장 함수
let PRISTINE_HTML_SNAPSHOT = null;

function capturePristineHtmlSnapshot() {
    if (!PRISTINE_HTML_SNAPSHOT) {
        PRISTINE_HTML_SNAPSHOT = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    }
}

async function downloadShareableHtml() {
    if (!PRISTINE_HTML_SNAPSHOT) {
        showToast(currentLang === 'en' ? 'Snapshot is not ready yet.' : 'HTML 스냅샷이 아직 준비되지 않았습니다.');
        return;
    }

    const startMarker = '/* __BAKED_DATA_START__ */';
    const endMarker = '/* __BAKED_DATA_END__ */';
    const newRevision = Date.now();
    const closingScriptTag = '</' + 'script>';
    const safeJson = JSON.stringify(factoryBlocksData, null, 12)
        .replace(new RegExp('<\\/' + 'script', 'gi'), '<\\\\/' + 'script');

    const bakedReplacement =
        startMarker + '\n' +
        'const DEFAULT_DATA_REVISION = ' + newRevision + ';\n' +
        'const DEFAULT_FACTORY_BLOCKS_DATA = ' + safeJson + ';\n' +
        endMarker;

    let finalHtml = '';
    const startIdx = PRISTINE_HTML_SNAPSHOT.indexOf(startMarker);
    const endIdx = PRISTINE_HTML_SNAPSHOT.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        // 단일 HTML 모드 하위 호환
        finalHtml =
            PRISTINE_HTML_SNAPSHOT.slice(0, startIdx) +
            bakedReplacement +
            PRISTINE_HTML_SNAPSHOT.slice(endIdx + endMarker.length);
    } else {
        // 분리된 index.html + styles.css + app.js 환경: CSS/JS를 읽어 단일 공유용 HTML로 병합
        try {
            const [cssRes, jsRes] = await Promise.all([
                fetch('./styles.css', { cache: 'no-store' }),
                fetch('./app.js', { cache: 'no-store' })
            ]);
            if (!cssRes.ok || !jsRes.ok) {
                throw new Error('Failed to fetch separated assets');
            }
            const [cssText, jsText] = await Promise.all([cssRes.text(), jsRes.text()]);
            const jsStart = jsText.indexOf(startMarker);
            const jsEnd = jsText.indexOf(endMarker);
            if (jsStart === -1 || jsEnd === -1 || jsEnd <= jsStart) {
                throw new Error('Data block marker not found in app.js');
            }

            const bakedJs = (
                jsText.slice(0, jsStart) +
                bakedReplacement +
                jsText.slice(jsEnd + endMarker.length)
            ).replace(new RegExp('<\\/' + 'script', 'gi'), '<\\\\/' + 'script');

            const styleLinkRegex = /<link[^>]*href=["']styles\.css(?:\?[^"']*)?["'][^>]*>/i;
            const appScriptRegex = new RegExp('<script[^>]*src=["\']app\\.js(?:\\?[^"\']*)?["\'][^>]*>\\s*<\\/' + 'script>', 'i');

            finalHtml = PRISTINE_HTML_SNAPSHOT
                .replace(styleLinkRegex, () => '<style>\n' + cssText + '\n</style>')
                .replace(appScriptRegex, () => '<script>\n' + bakedJs + '\n' + closingScriptTag);
        } catch (err) {
            showToast(currentLang === 'en'
                ? 'Standalone HTML export requires HTTP/HTTPS for split files. Use [Save data.json] or [Export Excel].'
                : '분리 파일의 로컬(file://) 환경에서는 단일 HTML 병합이 제한됩니다. [data.json 저장] 또는 [엑셀 내보내기]를 이용하세요.');
            return;
        }
    }

    const blob = new Blob([finalHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `3d_inventory_shared_${today}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(currentLang === 'en'
        ? 'Saved shareable HTML with all current rack layouts & inventory!'
        : '현재 랙 배치와 재고 데이터가 모두 포함된 공유용 HTML 파일이 저장되었습니다!');
}

function downloadDataJson() {
    const payload = {
        revision: Date.now(),
        updatedAt: new Date().toISOString(),
        blocks: factoryBlocksData
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(currentLang === 'en'
        ? 'Downloaded data.json. Place it next to index.html to deploy!'
        : '배포용 data.json 파일이 다운로드되었습니다. index.html과 같은 폴더에 올리세요.');
}

function triggerJsonImport() {
    const input = document.getElementById('json-file-input');
    input.value = '';
    input.click();
}

function handleJsonFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            const blocks = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.blocks) ? parsed.blocks : null);
            if (!blocks || blocks.length === 0) {
                showToast(currentLang === 'en' ? 'Invalid data.json format.' : '유효한 랙/재고 JSON 형식이 아닙니다.');
                return;
            }
            factoryBlocksData = normalizeBlocksArray(blocks);
            currentSourceHash = computeDataHash(factoryBlocksData);
            rebuildAllBlocks3D();
            saveFactoryData(true);

            if (factoryBlocksData.length > 0) {
                selectedBlockId = factoryBlocksData[0].id;
                selectedTier = null;
            }
            renderInventoryPage();
            if (currentPage === 'inventory') {
                const firstGrp = getGroupedInventoryData()[0];
                if (firstGrp) previewProfileOn3D(firstGrp.key);
            } else if (selectedBlockId) {
                selectBlock(selectedBlockId, false, null);
            }
            showToast(currentLang === 'en' ? `Loaded ${blocks.length} racks from JSON.` : `JSON 파일에서 ${blocks.length}개 랙 데이터를 불러왔습니다.`);
        } catch (err) {
            console.error(err);
            showToast(currentLang === 'en' ? 'Failed to parse JSON file.' : 'JSON 파일을 읽는 중 오류가 발생했습니다.');
        }
    };
    reader.readAsText(file, 'utf-8');
}

async function reloadFromDataJson() {
    try {
        const res = await fetch(`./data.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const remoteBlocks = Array.isArray(json) ? json : (Array.isArray(json.blocks) ? json.blocks : null);
        if (!remoteBlocks || remoteBlocks.length === 0) {
            showToast(currentLang === 'en' ? 'data.json has no blocks.' : 'data.json에 랙 데이터가 없습니다.');
            return;
        }
        factoryBlocksData = normalizeBlocksArray(remoteBlocks);
        currentSourceHash = computeDataHash(factoryBlocksData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            revision: Math.max(DEFAULT_DATA_REVISION, Number(json.revision) || 1),
            sourceHash: currentSourceHash,
            dirty: false,
            blocks: factoryBlocksData
        }));
        rebuildAllBlocks3D();
        renderInventoryPage();
        if (currentPage === 'inventory') {
            const firstGrp = getGroupedInventoryData()[0];
            if (firstGrp) previewProfileOn3D(firstGrp.key);
        } else if (factoryBlocksData[0]) {
            selectBlock(factoryBlocksData[0].id, false, null);
        }
        showToast(currentLang === 'en' ? 'Synced with data.json.' : '서버의 data.json 데이터와 동기화되었습니다.');
    } catch (err) {
        showToast(currentLang === 'en'
            ? 'Cannot fetch ./data.json directly over file://. Use [Import JSON] or a web server.'
            : '로컬(file://)에서는 자동 동기화가 제한됩니다. [JSON 불러오기] 또는 웹 서버 배포 환경에서 사용하세요.');
    }
}

/**
 * 9. Supabase 정규화 테이블 실시간 클라우드 DB 연동 (racks / profiles / rack_inventory)
 */
let supabaseClient = null;
let supabaseRealtimeChannel = null;
let cloudSyncState = 'disconnected'; // 'disconnected' | 'syncing' | 'connected' | 'error'
let cloudStatusMessage = '';
let lastCloudSyncAt = null;
let lastSyncedHash = null;
let cloudPushTimer = null;
let realtimePullTimer = null;
let isPushingToCloud = false;
let pendingRemoteBlocks = null;

function generateRowId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'inv-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function normalizeSupabaseUrl(raw) {
    if (typeof raw !== 'string') return '';
    return raw.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}

function getSupabaseConfig() {
    let override = {};
    try {
        const raw = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
        if (raw) override = JSON.parse(raw) || {};
    } catch (_) {}

    const cleanStr = (val) => (typeof val === 'string' ? val.trim() : '');
    return {
        url: normalizeSupabaseUrl(override.url) || normalizeSupabaseUrl(DEFAULT_SUPABASE_CONFIG.url),
        anonKey: cleanStr(override.anonKey) || cleanStr(DEFAULT_SUPABASE_CONFIG.anonKey),
        autoSync: typeof override.autoSync === 'boolean' ? override.autoSync : Boolean(DEFAULT_SUPABASE_CONFIG.autoSync),
        legacyTable: DEFAULT_SUPABASE_CONFIG.legacyTable || 'factory_inventory_state',
        legacyRowId: DEFAULT_SUPABASE_CONFIG.legacyRowId || 'main'
    };
}

function isSupabaseConfigured() {
    const cfg = getSupabaseConfig();
    return Boolean(cfg.url && cfg.anonKey && typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function');
}

function isSupabaseReady() {
    return Boolean(supabaseClient && cloudSyncState !== 'disconnected');
}

function setCloudStatus(state, message = '') {
    cloudSyncState = state;
    cloudStatusMessage = message;
    updateCloudStatusBadge();
}

function updateCloudStatusBadge() {
    const btn = document.getElementById('btn-cloud-config');
    const dot = document.getElementById('cloud-status-dot');
    const text = document.getElementById('cloud-status-text');
    const modalDot = document.getElementById('sb-modal-dot');
    const modalMsg = document.getElementById('sb-modal-status-msg');
    const modalLastSync = document.getElementById('sb-modal-last-sync');

    if (btn && dot && text) {
        if (cloudSyncState === 'connected') {
            btn.className = 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg';
            dot.className = 'w-2 h-2 rounded-full bg-emerald-400 inline-block';
            text.textContent = t('cloud_connected');
        } else if (cloudSyncState === 'syncing') {
            btn.className = 'bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg';
            dot.className = 'w-2 h-2 rounded-full bg-sky-400 animate-pulse inline-block';
            text.textContent = t('cloud_syncing');
        } else if (cloudSyncState === 'error') {
            btn.className = 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg';
            dot.className = 'w-2 h-2 rounded-full bg-rose-400 inline-block';
            text.textContent = t('cloud_error');
        } else {
            btn.className = 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg';
            dot.className = 'w-2 h-2 rounded-full bg-slate-500 inline-block';
            text.textContent = t('cloud_disconnected');
        }
    }

    if (modalDot && modalMsg) {
        if (cloudSyncState === 'connected') {
            modalDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0';
            modalMsg.textContent = cloudStatusMessage || (currentLang === 'en' ? 'Connected to Supabase (racks / profiles / rack_inventory)' : 'Supabase 3개 정규화 테이블 실시간 동기화 연결됨');
        } else if (cloudSyncState === 'syncing') {
            modalDot.className = 'w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shrink-0';
            modalMsg.textContent = cloudStatusMessage || (currentLang === 'en' ? 'Syncing with Supabase...' : 'Supabase와 동기화 중...');
        } else if (cloudSyncState === 'error') {
            modalDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0';
            modalMsg.textContent = cloudStatusMessage || (currentLang === 'en' ? 'Connection failed' : 'Supabase 연결 오류');
        } else {
            modalDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0';
            modalMsg.textContent = currentLang === 'en' ? 'Supabase URL & Anon Key required.' : 'Supabase URL과 Anon Key 설정이 필요합니다.';
        }
    }

    if (modalLastSync) {
        modalLastSync.textContent = lastCloudSyncAt ? new Date(lastCloudSyncAt).toLocaleTimeString() : '-';
    }
}

function buildNormalizedPayloads(blocks) {
    const now = new Date().toISOString();
    const profileMap = new Map();
    const rackRows = [];
    const invRows = [];

    (blocks || []).forEach((b, idx) => {
        rackRows.push({
            id: String(b.id),
            fac: String(b.fac || 'Fac C'),
            floor: b.floor === 'MEZZANINE' ? 'MEZZANINE' : 'GROUND',
            code_label: String(b.codeLabel || b.id),
            name: String(b.name || b.id),
            description: String(b.desc || ''),
            pos_x: Number(b.pos && b.pos.x) || 0,
            pos_y: b.floor === 'MEZZANINE' ? 6.5 : (Number(b.pos && b.pos.y) || 0),
            pos_z: Number(b.pos && b.pos.z) || 0,
            size_w: Math.max(0.5, Number(b.size && b.size.w) || 2),
            size_h: Math.max(0.5, Number(b.size && b.size.h) || 2.5),
            size_d: Math.max(0.5, Number(b.size && b.size.d) || 8),
            tiers: Math.max(1, parseInt(b.tiers) || 1),
            sort_order: idx,
            updated_at: now
        });

        (b.profiles || []).forEach(p => {
            const rawCode = String(p.code || '').trim();
            if (!rawCode) return;
            const upperKey = rawCode.toUpperCase();
            if (!profileMap.has(upperKey)) {
                profileMap.set(upperKey, {
                    code: rawCode,
                    name: String(p.name || rawCode).trim(),
                    length: String(getProfileLength(p) || '-').trim() || '-',
                    color: String(getProfileColor(p) || '-').trim() || '-',
                    material: String(p.material || 'A6063-T5').trim() || 'A6063-T5',
                    default_min_qty: Math.max(0, parseInt(p.minQty) || 30),
                    updated_at: now
                });
            }
            const canonicalCode = profileMap.get(upperKey).code;
            if (!p._invId) p._invId = generateRowId();

            const tierNum = Math.max(1, parseInt(p.tier) || 1);
            invRows.push({
                id: String(p._invId),
                rack_id: String(b.id),
                profile_code: canonicalCode,
                tier: tierNum,
                layer_label: String(p.layer || formatTier(tierNum)).trim() || formatTier(tierNum),
                qty: Math.max(0, parseInt(p.qty) || 0),
                min_qty: Math.max(0, parseInt(p.minQty) || 0),
                updated_at: now
            });
        });
    });

    return {
        rackRows,
        profileRows: Array.from(profileMap.values()),
        invRows,
        updatedAt: now
    };
}

function assembleBlocksFromNormalizedTables(rackRows, profileRows, invRows) {
    const profileByUpperCode = new Map();
    (profileRows || []).forEach(pr => {
        if (!pr || !pr.code) return;
        profileByUpperCode.set(String(pr.code).trim().toUpperCase(), pr);
    });

    const invByRackId = new Map();
    (invRows || []).forEach(inv => {
        if (!inv || !inv.rack_id) return;
        if (!invByRackId.has(inv.rack_id)) invByRackId.set(inv.rack_id, []);
        const master = profileByUpperCode.get(String(inv.profile_code || '').trim().toUpperCase());
        invByRackId.get(inv.rack_id).push({
            _invId: inv.id,
            tier: Number(inv.tier) || 1,
            code: master ? master.code : inv.profile_code,
            name: master ? master.name : inv.profile_code,
            length: master ? master.length : '-',
            color: master ? master.color : '-',
            material: master ? master.material : 'A6063-T5',
            layer: inv.layer_label || `L${Number(inv.tier) || 1}`,
            qty: Number(inv.qty) || 0,
            minQty: Number(inv.min_qty) || 0
        });
    });

    const blocks = (rackRows || []).map(r => {
        const rackProfiles = (invByRackId.get(r.id) || []).sort((a, b) =>
            (a.tier - b.tier) || a.code.localeCompare(b.code)
        );
        return {
            id: r.id,
            fac: r.fac,
            floor: r.floor,
            codeLabel: r.code_label || r.id,
            name: r.name || r.id,
            desc: r.description || '',
            pos: { x: Number(r.pos_x) || 0, y: Number(r.pos_y) || 0, z: Number(r.pos_z) || 0 },
            size: { w: Number(r.size_w) || 2, h: Number(r.size_h) || 2.5, d: Number(r.size_d) || 8 },
            status: 'normal',
            tiers: Number(r.tiers) || 1,
            profiles: rackProfiles
        };
    });

    return normalizeBlocksArray(blocks);
}

async function fetchNormalizedFromSupabase() {
    const [rackRes, profileRes, invRes] = await Promise.all([
        supabaseClient.from('racks').select('*').order('sort_order', { ascending: true }),
        supabaseClient.from('profiles').select('*'),
        supabaseClient.from('rack_inventory').select('*')
    ]);

    if (rackRes.error) throw rackRes.error;
    if (profileRes.error) throw profileRes.error;
    if (invRes.error) throw invRes.error;

    return {
        rackRows: rackRes.data || [],
        profileRows: profileRes.data || [],
        invRows: invRes.data || []
    };
}

async function tryMigrateFromLegacyStateTable() {
    const cfg = getSupabaseConfig();
    try {
        const { data, error } = await supabaseClient
            .from(cfg.legacyTable)
            .select('blocks')
            .eq('id', cfg.legacyRowId)
            .maybeSingle();
        if (!error && data && Array.isArray(data.blocks) && data.blocks.length > 0) {
            return normalizeBlocksArray(data.blocks);
        }
    } catch (_) {}
    return null;
}

function applyRemoteBlocksFromCloud(remoteBlocks, updatedAt = null, showNotice = false) {
    if (!Array.isArray(remoteBlocks) || remoteBlocks.length === 0) return;

    const normalized = normalizeBlocksArray(JSON.parse(JSON.stringify(remoteBlocks)));
    const incomingHash = computeDataHash(normalized);
    const localHash = computeDataHash(factoryBlocksData);

    lastSyncedHash = incomingHash;
    currentSourceHash = incomingHash;
    lastCloudSyncAt = updatedAt || new Date().toISOString();

    if (incomingHash === localHash) {
        // 동일 데이터라도 _invId 동기화를 위해 내부 배열만 업데이트
        factoryBlocksData = normalized;
        updateCloudStatusBadge();
        return;
    }

    factoryBlocksData = normalized;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            revision: Math.max(DEFAULT_DATA_REVISION, Date.now()),
            sourceHash: incomingHash,
            dirty: false,
            blocks: factoryBlocksData
        }));
    } catch (_) {}

    if (typeof scene !== 'undefined' && scene) {
        rebuildAllBlocks3D();
        if (factoryBlocksData.length > 0) {
            if (!factoryBlocksData.some(b => b.id === selectedBlockId)) {
                selectedBlockId = factoryBlocksData[0].id;
                selectedTier = null;
            }
            const activeBlock = factoryBlocksData.find(b => b.id === selectedBlockId);
            if (activeBlock) {
                populateEditorInputs(activeBlock);
                renderSidePanel(activeBlock, selectedTier);
                applySelectionHighlight(selectedBlockId, selectedTier);
            }
        }
        renderInventoryPage();
        if (currentPage === 'inventory' && previewedProfileKey) {
            previewProfileOn3D(previewedProfileKey, previewFocusLocation?.blockId || null, previewFocusLocation?.tier ?? null);
        }
        updateInventoryNavBadge();
    }

    updateCloudStatusBadge();
    if (showNotice) {
        showToast(currentLang === 'en'
            ? 'Synced latest layout & inventory from another device!'
            : '다른 컴퓨터에서 변경된 최신 레이아웃/재고가 실시간 반영되었습니다!');
    }
}

function teardownSupabaseRealtime() {
    if (realtimePullTimer) {
        clearTimeout(realtimePullTimer);
        realtimePullTimer = null;
    }
    if (supabaseRealtimeChannel && supabaseClient) {
        try {
            supabaseClient.removeChannel(supabaseRealtimeChannel);
        } catch (_) {}
    }
    supabaseRealtimeChannel = null;
}

function scheduleRealtimePull() {
    if (!getSupabaseConfig().autoSync || isPushingToCloud) return;
    if (realtimePullTimer) clearTimeout(realtimePullTimer);
    realtimePullTimer = setTimeout(async () => {
        realtimePullTimer = null;
        if (isPushingToCloud || !supabaseClient) return;
        try {
            const { rackRows, profileRows, invRows } = await fetchNormalizedFromSupabase();
            if (rackRows.length === 0) return;
            const assembled = assembleBlocksFromNormalizedTables(rackRows, profileRows, invRows);
            if (computeDataHash(assembled) === computeDataHash(factoryBlocksData)) return;

            if (typeof transformControl !== 'undefined' && transformControl && transformControl.dragging) {
                pendingRemoteBlocks = assembled;
                return;
            }
            applyRemoteBlocksFromCloud(assembled, new Date().toISOString(), true);
        } catch (err) {
            console.warn('Realtime sync fetch skipped:', err.message);
        }
    }, 350);
}

function subscribeSupabaseRealtime() {
    teardownSupabaseRealtime();
    if (!supabaseClient) return;

    supabaseRealtimeChannel = supabaseClient
        .channel('factory-normalized-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'racks' }, scheduleRealtimePull)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, scheduleRealtimePull)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rack_inventory' }, scheduleRealtimePull)
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                setCloudStatus('connected', currentLang === 'en' ? 'Connected (racks / profiles / rack_inventory)' : 'Supabase 정규화 테이블 실시간 동기화 연결됨');
            }
        });
}

async function initSupabaseConnection() {
    teardownSupabaseRealtime();
    supabaseClient = null;

    if (!isSupabaseConfigured()) {
        setCloudStatus('disconnected', '');
        return false;
    }

    const cfg = getSupabaseConfig();
    try {
        setCloudStatus('syncing', currentLang === 'en' ? 'Connecting to Supabase...' : 'Supabase 연결 중...');
        supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);

        const { rackRows, profileRows, invRows } = await fetchNormalizedFromSupabase();

        if (rackRows.length > 0) {
            const assembled = assembleBlocksFromNormalizedTables(rackRows, profileRows, invRows);
            const latestTs = rackRows[0].updated_at || new Date().toISOString();
            applyRemoteBlocksFromCloud(assembled, latestTs, false);
        } else {
            // 3개 테이블이 비어있으면 기존 factory_inventory_state 데이터가 있을 경우 자동 이관, 없으면 초기 데이터 시딩
            const legacyBlocks = await tryMigrateFromLegacyStateTable();
            if (legacyBlocks && legacyBlocks.length > 0) {
                factoryBlocksData = legacyBlocks;
            }
            const ok = await pushDataToSupabase({ silent: true });
            if (!ok) return false;
        }

        subscribeSupabaseRealtime();
        setCloudStatus('connected', currentLang === 'en' ? 'Connected (racks / profiles / rack_inventory)' : 'Supabase 정규화 테이블 실시간 동기화 연결됨');
        return true;
    } catch (err) {
        console.error('Supabase init error:', err);
        const msg = err && err.message ? err.message : 'Connection error';
        setCloudStatus('error', msg);
        return false;
    }
}

function scheduleCloudPush() {
    if (!isSupabaseConfigured()) return;
    const cfg = getSupabaseConfig();
    if (!cfg.autoSync) return;

    if (cloudPushTimer) clearTimeout(cloudPushTimer);
    setCloudStatus('syncing', currentLang === 'en' ? 'Saving to Supabase...' : 'Supabase에 저장 중...');
    cloudPushTimer = setTimeout(() => {
        cloudPushTimer = null;
        pushDataToSupabase({ silent: true });
    }, 800);
}

async function pushDataToSupabase({ silent = false } = {}) {
    if (!isSupabaseConfigured()) {
        if (!silent) openSupabaseModal();
        return false;
    }
    const cfg = getSupabaseConfig();
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
    }

    isPushingToCloud = true;
    try {
        setCloudStatus('syncing', currentLang === 'en' ? 'Saving to normalized tables...' : '정규화 테이블에 저장 중...');
        const { rackRows, profileRows, invRows, updatedAt } = buildNormalizedPayloads(factoryBlocksData);

        if (profileRows.length > 0) {
            const { error: profErr } = await supabaseClient
                .from('profiles')
                .upsert(profileRows, { onConflict: 'code' });
            if (profErr) throw profErr;
        }

        if (rackRows.length > 0) {
            const { error: rackErr } = await supabaseClient
                .from('racks')
                .upsert(rackRows, { onConflict: 'id' });
            if (rackErr) throw rackErr;
        }

        if (invRows.length > 0) {
            const { error: invErr } = await supabaseClient
                .from('rack_inventory')
                .upsert(invRows, { onConflict: 'id' });
            if (invErr) throw invErr;
        }

        // 삭제된 적재 항목 및 삭제된 랙 정리 (racks 삭제보다 rack_inventory 정리를 먼저 실행해 랙 코드 변경 시 연쇄 삭제 방지)
        const [{ data: remoteInvIds, error: selInvErr }, { data: remoteRackIds, error: selRackErr }] = await Promise.all([
            supabaseClient.from('rack_inventory').select('id'),
            supabaseClient.from('racks').select('id')
        ]);
        if (selInvErr) throw selInvErr;
        if (selRackErr) throw selRackErr;

        const currentInvIdSet = new Set(invRows.map(r => r.id));
        const removedInvIds = (remoteInvIds || []).map(r => r.id).filter(id => !currentInvIdSet.has(id));
        if (removedInvIds.length > 0) {
            const { error: delInvErr } = await supabaseClient.from('rack_inventory').delete().in('id', removedInvIds);
            if (delInvErr) throw delInvErr;
        }

        const currentRackIdSet = new Set(rackRows.map(r => r.id));
        const removedRackIds = (remoteRackIds || []).map(r => r.id).filter(id => !currentRackIdSet.has(id));
        if (removedRackIds.length > 0) {
            const { error: delRackErr } = await supabaseClient.from('racks').delete().in('id', removedRackIds);
            if (delRackErr) throw delRackErr;
        }

        lastSyncedHash = computeDataHash(factoryBlocksData);
        currentSourceHash = lastSyncedHash;
        lastCloudSyncAt = updatedAt;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            revision: DEFAULT_DATA_REVISION,
            sourceHash: lastSyncedHash,
            dirty: false,
            blocks: factoryBlocksData
        }));

        if (!supabaseRealtimeChannel) {
            subscribeSupabaseRealtime();
        }
        setCloudStatus('connected', currentLang === 'en' ? 'Saved to Supabase!' : 'Supabase 저장 완료');
        if (!silent) {
            showToast(currentLang === 'en'
                ? 'Saved to Supabase! Other devices will reflect this immediately.'
                : 'Supabase 서버에 저장되었습니다! 다른 컴퓨터에서도 바로 반영됩니다.');
        }
        return true;
    } catch (err) {
        console.error('Supabase push error:', err);
        setCloudStatus('error', err.message || 'Save failed');
        if (!silent) {
            showToast((currentLang === 'en' ? 'Supabase save failed: ' : '서버 저장 실패: ') + (err.message || 'Error'));
        }
        return false;
    } finally {
        setTimeout(() => { isPushingToCloud = false; }, 300);
    }
}

async function pullDataFromSupabase({ silent = false } = {}) {
    if (!isSupabaseConfigured()) {
        if (!silent) openSupabaseModal();
        return false;
    }
    const cfg = getSupabaseConfig();
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
    }

    try {
        setCloudStatus('syncing', currentLang === 'en' ? 'Fetching from Supabase...' : '서버 데이터 불러오는 중...');
        const { rackRows, profileRows, invRows } = await fetchNormalizedFromSupabase();
        if (rackRows.length === 0) {
            setCloudStatus('connected', currentLang === 'en' ? 'No remote racks yet.' : '서버에 저장된 랙 데이터가 아직 없습니다.');
            if (!silent) {
                showToast(currentLang === 'en' ? 'No saved data on Supabase yet.' : '서버에 저장된 데이터가 아직 없습니다.');
            }
            return false;
        }

        const assembled = assembleBlocksFromNormalizedTables(rackRows, profileRows, invRows);
        applyRemoteBlocksFromCloud(assembled, new Date().toISOString(), false);
        setCloudStatus('connected', currentLang === 'en' ? 'Synced from Supabase' : '서버 데이터 동기화 완료');
        if (!silent) {
            showToast(currentLang === 'en' ? 'Loaded latest layout & inventory from Supabase!' : 'Supabase에서 최신 레이아웃과 재고를 불러왔습니다!');
        }
        return true;
    } catch (err) {
        console.error('Supabase pull error:', err);
        setCloudStatus('error', err.message || 'Fetch failed');
        if (!silent) {
            showToast((currentLang === 'en' ? 'Supabase load failed: ' : '서버 불러오기 실패: ') + (err.message || 'Error'));
        }
        return false;
    }
}

function pushToSupabaseManual() {
    if (cloudPushTimer) {
        clearTimeout(cloudPushTimer);
        cloudPushTimer = null;
    }
    pushDataToSupabase({ silent: false });
}

function pullFromSupabaseManual() {
    pullDataFromSupabase({ silent: false });
}

function openSupabaseModal() {
    const cfg = getSupabaseConfig();
    document.getElementById('sb-form-url').value = cfg.url;
    document.getElementById('sb-form-key').value = cfg.anonKey;
    document.getElementById('sb-form-autosync').checked = cfg.autoSync;
    updateCloudStatusBadge();
    document.getElementById('supabase-modal').classList.remove('hidden');
}

function closeSupabaseModal() {
    document.getElementById('supabase-modal').classList.add('hidden');
}

async function saveSupabaseConfigAndConnect() {
    const url = normalizeSupabaseUrl(document.getElementById('sb-form-url').value);
    const anonKey = document.getElementById('sb-form-key').value.trim();
    const autoSync = document.getElementById('sb-form-autosync').checked;

    if (!url || !anonKey) {
        showToast(currentLang === 'en' ? 'Please enter both Supabase URL and Anon Key.' : 'Supabase URL과 Anon Key를 모두 입력해주세요.');
        return;
    }

    localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify({ url, anonKey, autoSync }));
    const ok = await initSupabaseConnection();
    if (ok) {
        showToast(currentLang === 'en' ? 'Supabase connected & synced!' : 'Supabase 연결 및 동기화가 완료되었습니다!');
        closeSupabaseModal();
    } else {
        showToast(currentLang === 'en' ? 'Failed to connect. Check URL/Key or run SQL setup.' : '연결 실패: URL/Key 또는 테이블 SQL 설정을 확인해주세요.');
    }
}

function clearSupabaseOverrideConfig() {
    localStorage.removeItem(SUPABASE_CONFIG_STORAGE_KEY);
    teardownSupabaseRealtime();
    supabaseClient = null;
    initSupabaseConnection();
    openSupabaseModal();
    showToast(currentLang === 'en' ? 'Supabase browser settings cleared.' : '브라우저에 저장된 DB 설정을 초기화했습니다.');
}

function copySupabaseSql() {
    const sql = [
        `create table if not exists public.racks (`,
        `  id text primary key,`,
        `  fac text not null,`,
        `  floor text not null check (floor in ('GROUND', 'MEZZANINE')),`,
        `  code_label text not null,`,
        `  name text not null,`,
        `  description text not null default '',`,
        `  pos_x double precision not null default 0,`,
        `  pos_y double precision not null default 0,`,
        `  pos_z double precision not null default 0,`,
        `  size_w double precision not null default 2.0,`,
        `  size_h double precision not null default 2.5,`,
        `  size_d double precision not null default 8.0,`,
        `  tiers integer not null default 1,`,
        `  sort_order integer not null default 0,`,
        `  updated_at timestamptz not null default now()`,
        `);`,
        ``,
        `create table if not exists public.profiles (`,
        `  code text primary key,`,
        `  name text not null,`,
        `  length text not null default '-',`,
        `  color text not null default '-',`,
        `  material text not null default 'A6063-T5',`,
        `  default_min_qty integer not null default 30,`,
        `  updated_at timestamptz not null default now()`,
        `);`,
        ``,
        `create table if not exists public.rack_inventory (`,
        `  id text primary key,`,
        `  rack_id text not null references public.racks(id) on delete cascade on update cascade,`,
        `  profile_code text not null references public.profiles(code) on delete cascade on update cascade,`,
        `  tier integer not null default 1,`,
        `  layer_label text not null default 'L1',`,
        `  qty integer not null default 0 check (qty >= 0),`,
        `  min_qty integer not null default 0 check (min_qty >= 0),`,
        `  updated_at timestamptz not null default now()`,
        `);`,
        ``,
        `create index if not exists idx_rack_inventory_rack_id on public.rack_inventory(rack_id);`,
        `create index if not exists idx_rack_inventory_profile_code on public.rack_inventory(profile_code);`,
        ``,
        `alter table public.racks enable row level security;`,
        `alter table public.profiles enable row level security;`,
        `alter table public.rack_inventory enable row level security;`,
        ``,
        `drop policy if exists "racks_public_all" on public.racks;`,
        `create policy "racks_public_all" on public.racks for all using (true) with check (true);`,
        `drop policy if exists "profiles_public_all" on public.profiles;`,
        `create policy "profiles_public_all" on public.profiles for all using (true) with check (true);`,
        `drop policy if exists "rack_inventory_public_all" on public.rack_inventory;`,
        `create policy "rack_inventory_public_all" on public.rack_inventory for all using (true) with check (true);`,
        ``,
        `do $$ begin`,
        `  begin alter publication supabase_realtime add table public.racks; exception when duplicate_object then null; end;`,
        `  begin alter publication supabase_realtime add table public.profiles; exception when duplicate_object then null; end;`,
        `  begin alter publication supabase_realtime add table public.rack_inventory; exception when duplicate_object then null; end;`,
        `end $$;`
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sql).then(() => {
            showToast(currentLang === 'en' ? 'Copied normalized SQL (3 tables) to clipboard!' : '3개 정규화 테이블 SQL이 클립보드에 복사되었습니다!');
        }).catch(() => {
            showToast(currentLang === 'en' ? 'Clipboard copy failed.' : '클립보드 복사에 실패했습니다.');
        });
    }
}

// 페이지 로드 완료 시 초기화
window.onload = async function() {
    capturePristineHtmlSnapshot();
    await loadInitialDataFromJsonOrStorage();
    await initSupabaseConnection();
    init3D();
    applyLanguage();
    updateInventoryNavBadge();
    updateCloudStatusBadge();
    if (window.location.hash === '#inventory') {
        switchPage('inventory');
    }
};

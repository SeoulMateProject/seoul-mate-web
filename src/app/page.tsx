import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">장소 찾기</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          (초기 화면) 하단 네비게이션 바는 공통 레이아웃에 포함되어 있습니다.
        </p>
      </div>
    </div>
  );
}

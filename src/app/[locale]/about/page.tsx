import PageLayout from '@/components/PageLayout'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'ko'

  return (
    <PageLayout locale={locale} currentPath="/about">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {lang === 'ko' ? '인톡파트너스 소개' : 'About InTalk Partners'}
      </h1>

      <div className="prose prose-lg max-w-none">
        {lang === 'ko' ? (
          <>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              <strong>주식회사 인톡</strong>은 AI와 함께하는 보험설계사 커리어 플랫폼입니다.
              보험설계사 직종의 전문 인력 양성 및 커리어 개발을 지원하며,
              누구나 쉽게 보험 전문가로 성장할 수 있는 환경을 제공합니다.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">인톡블로그란?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              인톡블로그는 보험에 대한 실용적인 정보를 제공하는 블로그입니다.
              보험 비교, 가입 가이드, 보험금 청구 방법 등
              일상에서 꼭 필요한 보험 지식을 알기 쉽게 전달합니다.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">주요 서비스</h2>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-[#2C5697] font-bold mt-0.5">-</span>
                <span><strong>AI 기반 교육</strong> - 무료 교육 프로그램으로 보험 전문가 양성</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2C5697] font-bold mt-0.5">-</span>
                <span><strong>커리어 개발</strong> - 직장인, 주부, N잡러를 위한 부업 기회 제공</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2C5697] font-bold mt-0.5">-</span>
                <span><strong>리워드 시스템</strong> - 포인트 기반 보상 제도 운영</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">문의</h2>
            <p className="text-gray-700 leading-relaxed">
              자세한 문의는{' '}
              <a href="https://www.intalkpartners.com" target="_blank" rel="noopener noreferrer" className="text-[#2C5697] hover:underline font-medium">
                인톡파트너스 공식 웹사이트
              </a>
              를 방문하시거나{' '}
              <a href="http://pf.kakao.com/_ChIBxj" target="_blank" rel="noopener noreferrer" className="text-[#2C5697] hover:underline font-medium">
                카카오톡 채널
              </a>
              로 연락해 주세요.
            </p>
          </>
        ) : (
          <>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              <strong>InTalk Partners</strong> is an AI-powered career platform for insurance consultants.
              We support professional development and career growth in the insurance industry,
              providing an accessible path for anyone to become an insurance expert.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">About InTalk Blog</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              InTalk Blog provides practical insurance information including comparisons,
              enrollment guides, and claims processes to help you make informed decisions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Visit{' '}
              <a href="https://www.intalkpartners.com" target="_blank" rel="noopener noreferrer" className="text-[#2C5697] hover:underline font-medium">
                InTalk Partners
              </a>
              {' '}for more information.
            </p>
          </>
        )}
      </div>
    </PageLayout>
  )
}

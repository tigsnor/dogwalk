export default function AdminHomePage() {
  return (
    <main className="page">
      <header className="header">
        <h1>DogWalk 관리자 웹</h1>
        <p>워커 심사, 결제/환불, 운영 모니터링</p>
      </header>

      <section className="grid">
        <article className="card">
          <h2>워커 심사</h2>
          <p>승인 대기 목록 및 자격증 확인</p>
          <div className="placeholder">워커자격증검수이미지</div>
        </article>
        <article className="card">
          <h2>실시간 운영</h2>
          <p>현재 진행 중 산책 세션 모니터링</p>
          <div className="placeholder">실시간운영지도이미지</div>
        </article>
        <article className="card">
          <h2>결제/환불</h2>
          <p>결제 상태 조회 및 환불 처리</p>
          <div className="placeholder">결제환불관리이미지</div>
        </article>
        <article className="card">
          <h2>정산/크레딧</h2>
          <p>워커 정산 배치 및 크레딧 조정</p>
          <div className="placeholder">정산크레딧관리이미지</div>
        </article>
      </section>
    </main>
  );
}

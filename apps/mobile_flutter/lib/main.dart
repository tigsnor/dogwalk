import 'package:flutter/material.dart';

void main() {
  runApp(const DogWalkApp());
}

class DogWalkApp extends StatelessWidget {
  const DogWalkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DogWalk',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6D8DFF),
          secondary: Color(0xFF6EF3D6),
          surface: Color(0xFF141B35),
        ),
      ),
      home: const RoleSelectPage(),
    );
  }
}

class RoleSelectPage extends StatelessWidget {
  const RoleSelectPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0A0F26), Color(0xFF1C2559)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('로고이미지', style: TextStyle(fontSize: 18)),
                const SizedBox(height: 12),
                const Text(
                  'DogWalk 앱 시작',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                const Text('견주/워커 역할을 선택하세요.'),
                const SizedBox(height: 24),
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    children: [
                      RoleCard(
                        title: '견주 앱',
                        subtitle: '예약 · 실시간 확인 · 기록',
                        imageLabel: '강아지사진이미지',
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const OwnerHomePage(),
                          ),
                        ),
                      ),
                      RoleCard(
                        title: '워커 앱',
                        subtitle: '요청 수락 · 산책 수행',
                        imageLabel: '산책중강아지이미지',
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const WalkerHomePage(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class RoleCard extends StatelessWidget {
  const RoleCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.imageLabel,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final String imageLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Ink(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white24),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text(subtitle),
              const Spacer(),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white30),
                ),
                child: Center(child: Text(imageLabel)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OwnerHomePage extends StatelessWidget {
  const OwnerHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const HomeTemplate(
      title: '견주 홈',
      sections: [
        '대리산책예약카드이미지',
        '실시간트래킹지도이미지',
        '셀프산책기록카드이미지',
        '쇼핑상품이미지',
      ],
    );
  }
}

class WalkerHomePage extends StatelessWidget {
  const WalkerHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const HomeTemplate(
      title: '워커 홈',
      sections: [
        '요청리스트카드이미지',
        '산책수행카드이미지',
        '정산요약카드이미지',
        '리뷰요약카드이미지',
      ],
    );
  }
}

class HomeTemplate extends StatelessWidget {
  const HomeTemplate({
    super.key,
    required this.title,
    required this.sections,
  });

  final String title;
  final List<String> sections;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemBuilder: (context, index) => Container(
          height: 120,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white24),
          ),
          child: Center(child: Text(sections[index])),
        ),
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemCount: sections.length,
      ),
    );
  }
}

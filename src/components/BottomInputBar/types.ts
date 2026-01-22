export type Language = 'en' | 'ru' | 'hy' | 'ko';
export type ActionMode = 'analyze' | 'chat' | 'podcast' | 'course';

export interface MediaFile {
  data: string;
  mimeType: string;
  name: string;
}

export interface BottomInputBarProps {
  language: Language;
  onSubmit: (text: string, mode: ActionMode, media?: MediaFile[] | null) => void;
  isProcessing: boolean;
  isLocked: boolean;
}

export const uiLabels = {
  en: {
    placeholder: {
      analyze: 'Paste text or attach files to analyze...',
      chat: 'Ask a question about any topic...',
      podcast: 'Enter a topic to generate a podcast discussion...',
      course: 'Paste course materials for a structured learning plan...'
    },
    modes: {
      analyze: 'Analyse',
      chat: 'Chat',
      podcast: 'Podcast',
      course: 'Course'
    },
    tooltips: {
      analyze: 'Full pedagogical analysis',
      chat: 'General Q&A',
      podcast: 'Generate audio podcast',
      course: 'Structured course plan'
    },
    submit: 'Send',
    processing: 'Processing...',
    attachFile: 'Attach files',
    fileAttached: 'file attached',
    filesAttached: 'files attached',
    upgradeTooltip: 'Upgrade to continue',
    dropFiles: 'Drop files here',
    voiceInput: 'Voice input',
    listening: 'Listening...'
  },
  ru: {
    placeholder: {
      analyze: 'Вставьте текст или прикрепите файлы для анализа...',
      chat: 'Задайте вопрос на любую тему...',
      podcast: 'Введите тему для создания подкаста...',
      course: 'Вставьте материалы курса для структурированного плана...'
    },
    modes: {
      analyze: 'Анализ',
      chat: 'Чат',
      podcast: 'Подкаст',
      course: 'Курс'
    },
    tooltips: {
      analyze: 'Полный педагогический анализ',
      chat: 'Общие вопросы и ответы',
      podcast: 'Создать аудио подкаст',
      course: 'Структурированный план курса'
    },
    submit: 'Отправить',
    processing: 'Обработка...',
    attachFile: 'Прикрепить файлы',
    fileAttached: 'файл прикреплён',
    filesAttached: 'файлов прикреплено',
    upgradeTooltip: 'Обновите для продолжения',
    dropFiles: 'Перетащите файлы сюда',
    voiceInput: 'Голосовой ввод',
    listening: 'Слушаю...'
  },
  hy: {
    placeholder: {
      analyze: 'Տեղադրեք տեքստ կամ կցեք ֆայլեր վերլուծության համար...',
      chat: 'Հարց տվեք ցանկացած թեմայի շուրջ...',
      podcast: 'Մուտքագրեք թեմա պոդկաստի քննարկում ստեղծելու համար...',
      course: 'Տեղադրեք դասընթացի նյութեր կառուցվածքային ուսումնական պլանի համար...'
    },
    modes: {
      analyze: 'Վերլուծել',
      chat: 'Զրուցարան',
      podcast: 'Պոդկաստ',
      course: 'Դասընթաց'
    },
    tooltips: {
      analyze: 'Ամբողջական մանկավարժական վերլուծություն',
      chat: 'Ընդհանուր հարց ու պատասխան',
      podcast: 'Ստեղծել աուդիո պոդկաստ',
      course: 'Կառուցվածքային դասընթացի պլան'
    },
    submit: 'Ուղարկել',
    processing: 'Մշակվում է...',
    attachFile: 'Կցել ֆայլեր',
    fileAttached: 'ֆայլ կցված է',
    filesAttached: 'ֆայլեր կցված են',
    upgradeTooltip: 'Թարմացրեք շարունակելու համար',
    dropFiles: 'Գցեք ֆայլերը այստեղ',
    voiceInput: 'Ձայնային մուտքագրում',
    listening: 'Լսում եմ...'
  },
  ko: {
    placeholder: {
      analyze: '텍스트를 붙여넣거나 파일을 첨부하여 분석...',
      chat: '어떤 주제에 대해 질문하세요...',
      podcast: '팟캐스트 토론을 생성할 주제를 입력하세요...',
      course: '구조화된 학습 계획을 위한 코스 자료를 붙여넣으세요...'
    },
    modes: {
      analyze: '분석',
      chat: '채팅',
      podcast: '팟캐스트',
      course: '코스'
    },
    tooltips: {
      analyze: '전체 교육 분석',
      chat: '일반 Q&A',
      podcast: '오디오 팟캐스트 생성',
      course: '구조화된 코스 계획'
    },
    submit: '전송',
    processing: '처리 중...',
    attachFile: '파일 첨부',
    fileAttached: '개 파일 첨부됨',
    filesAttached: '개 파일 첨부됨',
    upgradeTooltip: '계속하려면 업그레이드',
    dropFiles: '파일을 여기에 놓으세요',
    voiceInput: '음성 입력',
    listening: '듣는 중...'
  }
};

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Hata durumunu güncelle
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Hata bilgilerini kaydedebilirsin (örneğin, bir hata izleme servisine göndermek için)
    console.error("Hata yakalandı:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Hata mesajı göstermek için özelleştirilebilir bir arayüz
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Bir şeyler yanlış gitti.</h1>
          <p>Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    // Eğer hata yoksa, normalde olduğu gibi bileşenleri render et
    return this.props.children;
  }
}

export default ErrorBoundary;

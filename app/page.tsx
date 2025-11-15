import StoryboardApp from '../components/StoryboardApp';

export default function Page() {
  return (
    <div className="container">
      <header className="header">
        <div>
          <div className="brand">AI Storyboard Generator</div>
          <div className="small">Write a story ? Set duration ? Pick scenes ? Preview with voice</div>
        </div>
        <span className="badge">Free ? No signup</span>
      </header>

      <StoryboardApp />

      <div className="footer">? {new Date().getFullYear()} AI Storyboard Generator. All rights reserved.</div>
    </div>
  );
}

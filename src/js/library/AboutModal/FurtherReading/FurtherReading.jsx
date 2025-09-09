import './further-reading.styl';

function FurtherReading() {
  return (
    <article className="further-reading">
      <section className="further-reading__section">
        <div className="further-reading__book further-reading__book--featured">
          <h4 className="further-reading__book-title">Broken Money</h4>
          <p className="further-reading__book-subtitle">Why Our Financial System is Failing Us and How We Can Make it Better</p>
          <p className="further-reading__book-author">by Lyn Alden</p>
          <p className="further-reading__book-description">
            This book was the direct inspiration for creating this website. While it's a substantial read, it is well written and accessible. 
            The book's goal is for the reader to walk away with a deep understanding of money and monetary history, both in terms of theoretical foundations and in terms of practical implications.
          </p>
          <p className="further-reading__book-description">Highly recommended!</p>
          <a 
            href="https://www.goodreads.com/book/show/197566578-broken-money" 
            target="_blank" 
            rel="noopener noreferrer"
            className="further-reading__link"
          >
            View on Goodreads →
          </a>
        </div>
      </section>

      <section className="further-reading__section">
        <h3 className="further-reading__section-title">Additional Recommended Books</h3>
        <p className="further-reading__intro">
          These books provide different perspectives on monetary systems, financial inequality, and economic history:
        </p>
        
        <div className="further-reading__books">
          <div className="further-reading__book">
            <h4 className="further-reading__book-title">Check Your Financial Privilege</h4>
            <p className="further-reading__book-author">by Alex Gladstein</p>
            <p className="further-reading__book-description">
              An eye-opening examination of how monetary systems create and perpetuate global inequality.
            </p>
            <a 
              href="https://www.goodreads.com/book/show/60591550-check-your-financial-privilege" 
              target="_blank" 
              rel="noopener noreferrer"
              className="further-reading__link"
            >
              View on Goodreads →
            </a>
          </div>

          <div className="further-reading__book">
            <h4 className="further-reading__book-title">The Fiat Standard</h4>
            <p className="further-reading__book-author">by Saifedean Ammous</p>
            <p className="further-reading__book-description">
              A critical analysis of fiat monetary systems and their impact on society and economics.
            </p>
            <a 
              href="https://www.goodreads.com/en/book/show/59539733-the-fiat-standard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="further-reading__link"
            >
              View on Goodreads →
            </a>
          </div>

          <div className="further-reading__book">
            <h4 className="further-reading__book-title">Debt: The First 5,000 Years</h4>
            <p className="further-reading__book-author">by David Graeber</p>
            <p className="further-reading__book-description">
              A comprehensive historical perspective on debt, credit, and the evolution of economic systems.
            </p>
            <a 
              href="https://www.goodreads.com/book/show/6617037-debt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="further-reading__link"
            >
              View on Goodreads →
            </a>
          </div>
        </div>
      </section>

      <section className="further-reading__section">
        <h3 className="further-reading__section-title">Video Resources</h3>
        <p className="further-reading__intro">
          For those who prefer visual learning, these documentaries provide entertaining introductions to monetary systems. 
          <em>However, we strongly recommend reading the books above for deeper understanding.</em>
        </p>
        
        <div className="further-reading__videos">
          <div className="further-reading__video">
            <h4 className="further-reading__video-title">Princes of the Yen</h4>
            <p className="further-reading__video-subtitle">The Hidden Power of Central Banks</p>
            <p className="further-reading__video-description">
              An investigation into the role of central banks in shaping economic policy and their influence on society.
            </p>
            <a 
              href="https://www.youtube.com/watch?v=p5Ac7ap_MAY" 
              target="_blank" 
              rel="noopener noreferrer"
              className="further-reading__link"
            >
              Watch on YouTube →
            </a>
          </div>

          <div className="further-reading__video">
            <h4 className="further-reading__video-title">97% Owned</h4>
            <p className="further-reading__video-description">
              A documentary exploring how money is created and the implications of fractional reserve banking.
            </p>
            <a 
              href="https://www.youtube.com/watch?v=npXbFUAFtYk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="further-reading__link"
            >
              Watch on YouTube →
            </a>
          </div>
        </div>
      </section>

      <footer className="further-reading__footer">
        <p className="further-reading__disclaimer">
          These resources represent various viewpoints on monetary systems and economics. 
          We encourage critical thinking and forming your own conclusions based on multiple sources.
        </p>
      </footer>
    </article>
  );
}

export default FurtherReading;
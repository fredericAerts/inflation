import './about.styl';

function About() {
  return (
    <article className="about">
      <section className="about__section">
        <p className="about__paragraph">
          This website is an experiment by{' '}
          <a 
            href="https://www.fredericaerts.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="about__link"
          >
            Frederic Aerts
          </a>
          . I wanted to find out what it would be like to vibe code a website from start to finish, 
          while also learning how to integrate AI tools like GitHub Copilot into my workflow.
        </p>
        
        <p className="about__paragraph">
          For the subject matter, I drew inspiration from some books I've read about the global monetary system. 
          I am not a finance expert, but I felt compelled to share what I learned—especially the idea that 
          people in developed countries are financially privileged compared to much of the world. Our monetary 
          system is, in my view, a big piece of the puzzle behind many of today's global challenges, yet it's 
          something we rarely talk about.
        </p>
        
        <p className="about__paragraph">
          So while this project began as a way to gain firsthand experience with vibe coding, the content also 
          reflects my personal attempt to create awareness around money as a system, and the ways in which it 
          shapes our world.
        </p>
        
        <p className="about__paragraph">
          If you're curious about the code behind the website, the{' '}
          <a 
            href="https://github.com/fredericAerts/inflation" 
            target="_blank" 
            rel="noopener noreferrer"
            className="about__link"
          >
            GitHub repository is here
          </a>
          .
        </p>
      </section>
    </article>
  );
}

export default About;
import React from 'react'
import './PodcastHome.css'

const audioSrc = 'https://mazlabz.us.kg/latest-episode.mp3'

const PodcastHome = () => {
  return (
    <div className="podcast-home">
      <section className="hero">
        <img
          src="https://mazlabz.us.kg/fine-print-future.png"
          alt="Fine Print of the Future artwork"
          className="hero-image"
        />
        <h1>Fine Print of the Future</h1>
        <p className="hosts">MAZ, NOVA, Marcus</p>
      </section>
      <section className="player">
        <audio controls src={audioSrc}>
          Your browser does not support the audio element.
        </audio>
      </section>
      <div className="actions">
        <a
          className="cta subscribe"
          href="https://mazlabz.us.kg/subscribe"
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe
        </a>
        <a
          className="cta listen"
          href={audioSrc}
          target="_blank"
          rel="noopener noreferrer"
        >
          Listen now
        </a>
      </div>
    </div>
  )
}

export default PodcastHome

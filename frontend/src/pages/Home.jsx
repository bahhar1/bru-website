import { Link } from "react-router-dom";
import PlanCards, { Perks } from "../components/PlanCards.jsx";
import { useMenu } from "../useMenu.js";
import { SWATCHES, OUTLINE, STEP_LABELS } from "../theme.js";

const STEPS = [
  ["Build your Brü", "Pick your base, milk, sweetness and flavor online in under a minute."],
  ["Subscribe and forget", "Weekly, biweekly or monthly. Pause, skip or change your recipe anytime."],
  ["Grab and go", "Your exact order is waiting in the fridge. No brewing, no line, no settling."],
];

export default function Home() {
  const { menu } = useMenu();

  return (
    <>
      {/* Hero: cover slide */}
      <section className="hero">
        <img src="/images/hero-cans.jpg" alt="Five Brü cans, each with a different custom recipe, in a canvas bag on the sand" />
        <div className="hero-text">
          <h1 className="logo hero-logo">Brü</h1>
          <div>
            <p className="hero-tagline">Your coffee, your way,<br />ready when you are.</p>
            <Link to="/build" className="btn">Build your Brü</Link>
          </div>
        </div>
      </section>


      {/* Hook */}
      <section className="split hook">
        <div className="split-text">
          <p className="eyebrow">7:15 a.m.</p>
          <h2>You know exactly how you take your coffee. Your morning doesn't care.</h2>
          <ul className="tradeoffs">
            <li><strong>Make it at home</strong> and lose the time you don't have.</li>
            <li><strong>Hit the café</strong> and wait in line for your order.</li>
            <li><strong>Grab a can</strong> and settle for someone else's recipe.</li>
          </ul>
          <p className="hook-kicker">Fast or your way. Never both, until now.</p>
        </div>
        <img className="split-img" src="/images/pour.jpg" alt="A Vanilla Oat Latte Brü can pouring over ice" />
      </section>

      {/* Solution */}
      <section className="split reverse">
        <img className="split-img" src="/images/beach-can.jpg" alt="A hand holding a pink Brü can at the beach" />
        <div className="split-text">
          <p className="eyebrow">The solution</p>
          <h2>Coffee made to your exact order, delivered.</h2>
          <ol className="steps">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className="step-num">0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link to="/build" className="btn">Start building</Link>
        </div>
      </section>

      {/* Product */}
      <section className="page">
        <div className="product">
          <div>
            <p className="eyebrow">The product</p>
            <h2>Café-quality coffee,<br />made your way.</h2>
            <p className="lead">
              The same customization people already pay for at Starbucks, without the line. Every
              order ships to your door in a box like this.
            </p>
            <div className="menu-legend">
              {Object.entries(SWATCHES).map(([field, opts]) => (
                <div key={field}>
                  <p className="eyebrow">{STEP_LABELS[field].replace(/^Choose (your|a) /, "")}</p>
                  <ul>
                    {Object.entries(opts).map(([name, color]) => (
                      <li key={name}>
                        <span
                          className="dot"
                          style={color ? { background: color } : { boxShadow: `inset 0 0 0 1.5px ${OUTLINE[field]}` }}
                        />
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="muted formula">2 × 4 × 4 × 5 = <strong>160 recipes</strong>. One can with your name on it.</p>
          </div>
          <img className="framed" src="/images/box.jpg" alt="An open Brü delivery box with five custom cans" />
        </div>
      </section>

      {/* Plans */}
      <section className="page" id="plans">
        <p className="eyebrow">Plans &amp; pricing</p>
        <h2>Simple, flexible plans.</h2>
        <PlanCards plans={menu?.plans} />
        <Perks />
        <p className="tagline-italic">Up to 46% less than a daily $5.60 café latte.</p>
      </section>

      {/* Closing */}
      <section className="closing">
        <div className="closing-text">
          <h2>Your order, your way.</h2>
          <Link to="/build" className="btn">Build your Brü</Link>
        </div>
        <img src="/images/lineup.jpg" alt="Five Brü cans lined up in the sun" />
      </section>
    </>
  );
}
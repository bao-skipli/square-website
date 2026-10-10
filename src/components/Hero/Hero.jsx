import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

const VIDEO_URL =
  'https://pw-assets-production-c.squarecdn.com/video/5mObdhW0r5D0lyp3iVJFA6/b4d81931-7cfa-4402-bb41-efc4126e3f95-en-ee526a6b-3ca3-4ae5-9bc2-be60cb21229f-en-Homepage_Edit-updated.webm';

const images = [
  'https://images.ctfassets.net/2d5q1td6cyxq/2gJQ4VoAVwozevJEstfWum/292583cf5bd1152015d7b3f38c288be6/PD07743_-_man_carrying_pizzas.png?fm=avif&q=85&fit=fill&w=450',
  'https://images.ctfassets.net/2d5q1td6cyxq/46Kvvgf7rOBInftyvrCX13/90db0c9791023b5a3b44dd9d69b75709/PD07743_-_mechanic.png?fm=avif&q=85&fit=fill&w=400',
  'https://images.ctfassets.net/2d5q1td6cyxq/6m5BZ16kSmXvb0qxvHzugu/2c791d100d1c75a223468cf66b30968c/PD07743_-_USEN_register_pizza_shop.png?fm=avif&q=85&fit=fill&w=414',
  'https://images.ctfassets.net/2d5q1td6cyxq/6UtixBNNvdm51lv5hRRdj6/a554c7fd5ff026f5cf3e6e1a1e6b5fe3/PD07743_-_USEN_T3_phodega.png?fm=avif&q=85&fit=fill&w=480',
  'https://images.ctfassets.net/2d5q1td6cyxq/2ltlQY925uiWeSDy3aaFuV/f02a68c3b7ab9f960225e78ef9c3dbe7/PD07743_-_flower_person.png?fm=avif&q=85&fit=fill&w=464',
  'https://images.ctfassets.net/2d5q1td6cyxq/2l0Tud71FFtm4uWesUlW5R/f972dd0cfe1ec7d0e88431931ad0b1ca/PD07743_-_mush.png?fm=avif&q=85&fit=fill&w=604',
  'https://images.ctfassets.net/2d5q1td6cyxq/4J7X3ahr4KMdCFd7DfbmWb/e4e58d88a458857ecf5bcad24cb95b10/PD07743_-_hair_clip.png?fm=avif&q=85&fit=fill&w=480',
  'https://images.ctfassets.net/2d5q1td6cyxq/3IeOpuFwVkkbfJ8uvHDC86/f05c39a053a68283cc165e4a2239f6f0/PD07743_-_chef.png?fm=avif&q=85&fit=fill&w=398',
  'https://images.ctfassets.net/2d5q1td6cyxq/1ZogQZxHk2Uhssf8lV0WJ6/9b3001bf34f3de7057b6e06a0b4ef2da/placeholder.png?fm=avif&q=85&fit=fill&w=178',
];

const images2 = [
  'https://images.ctfassets.net/2d5q1td6cyxq/2gJQ4VoAVwozevJEstfWum/292583cf5bd1152015d7b3f38c288be6/PD07743_-_man_carrying_pizzas.png?fm=avif&q=85&fit=fill&w=450',
  'https://images.ctfassets.net/2d5q1td6cyxq/46Kvvgf7rOBInftyvrCX13/90db0c9791023b5a3b44dd9d69b75709/PD07743_-_mechanic.png?fm=avif&q=85&fit=fill&w=400',
  'https://images.ctfassets.net/2d5q1td6cyxq/6m5BZ16kSmXvb0qxvHzugu/2c791d100d1c75a223468cf66b30968c/PD07743_-_USEN_register_pizza_shop.png?fm=avif&q=85&fit=fill&w=414',
  'https://images.ctfassets.net/2d5q1td6cyxq/6UtixBNNvdm51lv5hRRdj6/a554c7fd5ff026f5cf3e6e1a1e6b5fe3/PD07743_-_USEN_T3_phodega.png?fm=avif&q=85&fit=fill&w=480',
  'https://images.ctfassets.net/2d5q1td6cyxq/2ltlQY925uiWeSDy3aaFuV/f02a68c3b7ab9f960225e78ef9c3dbe7/PD07743_-_flower_person.png?fm=avif&q=85&fit=fill&w=464',
  'https://images.ctfassets.net/2d5q1td6cyxq/2l0Tud71FFtm4uWesUlW5R/f972dd0cfe1ec7d0e88431931ad0b1ca/PD07743_-_mush.png?fm=avif&q=85&fit=fill&w=604',
  'https://images.ctfassets.net/2d5q1td6cyxq/4J7X3ahr4KMdCFd7DfbmWb/e4e58d88a458857ecf5bcad24cb95b10/PD07743_-_hair_clip.png?fm=avif&q=85&fit=fill&w=480',
  'https://images.ctfassets.net/2d5q1td6cyxq/3IeOpuFwVkkbfJ8uvHDC86/f05c39a053a68283cc165e4a2239f6f0/PD07743_-_chef.png?fm=avif&q=85&fit=fill&w=398',
  'https://images.ctfassets.net/2d5q1td6cyxq/1ZogQZxHk2Uhssf8lV0WJ6/9b3001bf34f3de7057b6e06a0b4ef2da/placeholder.png?fm=avif&q=85&fit=fill&w=178',
];

const PARTNER_LOGOS = [
  "/Frame_2147212722.avif",
  "/Frame_2147212724.avif",
  "/Frame_2147212725.avif",
  "/Frame_2147212728.avif",
  "/Frame_2147212729.avif",
  "/Frame_2147212730.avif",
  "/Frame_2147212732.avif",
  "/Frame_2147212733.avif",
  "/Frame_2147212734.avif",
  "/Frame_2147212735.avif",
];

const SLIDE_LOGOS = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

export default class Hero extends Component {
  renderRow = (list, prefix) =>
    list.map((image, i) => (
      <img key={`${prefix}-${i}`} src={image} alt="" className={styles["grid-image"]} />
    ));

  render() {
    return (
      <section className={styles["hero-section"]}>
        <div className={styles["video-wrapper"]}>
          <div className={styles["video-container"]}>
            <video
              className={styles["hero-video"]}
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={VIDEO_URL} type="video/webm" />
            </video>

            <div className={styles["hero-overlay"]}>
              <div className={styles["hero-overlay-gradient"]} />

              <div className={styles["hero-content"]}>
                <h1 className={styles["hero-title"]}>
                  Local legend or global icon.
                  <br />
                  Make it big on your block.
                </h1>
                <div className={styles["hero-actions"]}>
                  <Link to="/signup" className={styles["btn-primary"]}>
                    Get started
                  </Link>
                  <a href="#contact-sales" className={styles["btn-secondary"]}>
                    Contact sales
                  </a>
                </div>
              </div>

              <div className={styles["hero-slide-wrapper"]}>
                <div className={styles["hero-slide-track"]}>
                  {SLIDE_LOGOS.map((logo, index) => (
                    <div key={index} className={styles["hero-slide-item"]}>
                      <img
                        src={logo}
                        alt=""
                        className={styles["hero-slide-img"]}
                        loading="eager"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles["image-grid"]}>
          <div className={styles["grid-block"]}>
            <div className={styles.row}>{this.renderRow(images.slice(0, 4), "a")}</div>
            <div className={styles.row}>{this.renderRow(images.slice(4), "b")}</div>

            <div className={styles["center-text"]}>
              <span>Whatever your flavor of business, build and grow on your terms.</span>
            </div>

            <div className={styles.row}>
              {this.renderRow(images2.slice(0, 2), "c1")}
              <div className={styles.slot} />
              {this.renderRow(images2.slice(2, 4), "c2")}
            </div>

            <div className={styles.row}>{this.renderRow(images2.slice(4, 8), "d")}</div>
          </div>
        </div>
      </section>
    );
  }
}

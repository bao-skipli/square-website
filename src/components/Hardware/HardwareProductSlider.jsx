import React, { Component } from "react";
import HardwareProductCard from "./HardwareProductCard";
import styles from "./HardwareProductSlider.module.css";

const products = [
  {
    title: "Register (2nd generation)",
    description: "The all-in-one POS for your business",
    price: "$799 or $67/mo. over 12 months¹",
    image: "https://images.ctfassets.net/2d5q1td6cyxq/5WQriVmxim39RqIZAVC01J/9f7f6601f04378d5a90a40905f3a8dca/PD07744_-_USEN_register.png?fm=avif&q=85&fit=fill&w=884",
    video: "https://files.catbox.moe/mq9083.mp4",
  },
  {
    title: "Square Handheld",
    description: "The POS that moves with you",
    price: "$399 or $37/mo. over 12 months¹",
    image: "https://images.ctfassets.net/2d5q1td6cyxq/6pFGcpCRPBIJbgjtdcULff/c09b8dc3fcc3617222ab0955e58bc211/PD07747_-_USEN_T3.png?fm=avif&q=85&fit=fill&w=1232",
    video: "https://files.catbox.moe/mq9083.mp4",
  },
  {
    title: "Square Terminal",
    description: "The receipt-printing POS",
    price: "$299 or $27/mo. over 12 months¹",
    image: "https://images.ctfassets.net/2d5q1td6cyxq/2dyLERikxA50aVOktCx9Qv/8541f04728238908cf75efefdeb1fd7a/PD07747_-_USEN_terminal.png?fm=avif&q=85&fit=fill&w=894",
    video: "https://files.catbox.moe/mq9083.mp4",
  },
  {
    title: "Square Stand",
    description: "A flexible POS for your counter",
    price: "$149 or $14/mo. over 12 months¹",
    image: "https://images.ctfassets.net/2d5q1td6cyxq/4nqvRVdKD5ej670uvUnET4/06db369372a06f952c337c4e8a92c30c/PD07747_-_USEN_stand.png?fm=avif&q=85&fit=fill&w=896",
    video: "https://files.catbox.moe/mq9083.mp4",
  },
  {
    title: "Square Reader for contactless and chip",
    description: "The portable reader for every tap and dip",
    price: "$59 or $5/mo. over 12 months¹",
    image: "https://images.ctfassets.net/2d5q1td6cyxq/5qCnmHWQSoIdI9kLO6GPjq/604bad12cd3cebe9d1ebc5e05ae63784/PD07747_-_reader.png?fm=avif&q=85&fit=fill&w=894",
    video: "https://files.catbox.moe/mq9083.mp4",
  },
];

export default class HardwareProductSlider extends Component {
  constructor(props) {
    super(props);
    this.sliderRef = React.createRef();
    this.cardRefs = [];
  }

  componentDidMount() {
    this.adjustScrollPosition();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeIndex !== this.props.activeIndex) {
      this.adjustScrollPosition();
    }
  }

  adjustScrollPosition = () => {
    const { activeIndex } = this.props;
    if (activeIndex === null || activeIndex === undefined) return;

    const slider = this.sliderRef.current;
    const card = this.cardRefs[activeIndex];

    if (!slider || !card) return;

    requestAnimationFrame(() => {
      const sliderRect = slider.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const isPartiallyOffRight = cardRect.right > sliderRect.right;
      const isPartiallyOffLeft = cardRect.left < sliderRect.left;

      if (isPartiallyOffRight) {
        const offset = cardRect.right - sliderRect.right + 32;
        slider.scrollBy({ left: offset, behavior: "smooth" });
      } else if (isPartiallyOffLeft) {
        const offset = cardRect.left - sliderRect.left - 32;
        slider.scrollBy({ left: offset, behavior: "smooth" });
      }
    });
  };

  render() {
    const { activeIndex, setActiveIndex } = this.props;

    return (
      <div className={styles["hardware-product-slider"]} ref={this.sliderRef}>
        <div className={styles["hardware-product-track"]}>
          {products.map((product, index) => (
            <HardwareProductCard
              key={product.title}
              innerRef={(el) => {
                this.cardRefs[index] = el;
              }}
              product={product}
              isActive={activeIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  }
}

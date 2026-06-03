"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer/page";

export default function Home() {
  const joinSectionRef = useRef<HTMLElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const topConnectorRef = useRef<HTMLDivElement>(null);
  const bottomConnectorRef = useRef<HTMLDivElement>(null);
  const leftConnectorRef = useRef<HTMLDivElement>(null);
  const rightConnectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      if (!joinSectionRef.current) return;

      const currentScrollY = window.scrollY;
      const sectionTop = joinSectionRef.current.offsetTop;
      const sectionHeight = joinSectionRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      const sectionStart = sectionTop - windowHeight * 0.5;
      const sectionEnd = sectionTop + sectionHeight - windowHeight * 0.5;
      const scrollProgress = Math.max(
        0,
        Math.min(1, (currentScrollY - sectionStart) / (sectionEnd - sectionStart))
      );

      // Step 1: Card 1 appears first (at 10% scroll progress)
      if (scrollProgress >= 0.1) {
        if (card1Ref.current) card1Ref.current.classList.add("visible");
      } else {
        if (card1Ref.current) card1Ref.current.classList.remove("visible");
      }

      // Step 2: Top connector + Card 2 appear together (at 30% scroll progress)
      if (scrollProgress >= 0.3) {
        if (topConnectorRef.current) topConnectorRef.current.classList.add("visible");
        if (card2Ref.current) card2Ref.current.classList.add("visible");
      } else {
        if (topConnectorRef.current) topConnectorRef.current.classList.remove("visible");
        if (card2Ref.current) card2Ref.current.classList.remove("visible");
      }

      // Step 3: Left connector + Card 3 appear (at 50% scroll progress)
      if (scrollProgress >= 0.5) {
        if (leftConnectorRef.current) leftConnectorRef.current.classList.add("visible");
        if (card3Ref.current) card3Ref.current.classList.add("visible");
      } else {
        if (leftConnectorRef.current) leftConnectorRef.current.classList.remove("visible");
        if (card3Ref.current) card3Ref.current.classList.remove("visible");
      }

      // Step 4: Right and bottom connectors + Card 4 appear (at 70% scroll progress)
      if (scrollProgress >= 0.7) {
        if (rightConnectorRef.current) rightConnectorRef.current.classList.add("visible");
        if (bottomConnectorRef.current) bottomConnectorRef.current.classList.add("visible");
        if (card4Ref.current) card4Ref.current.classList.add("visible");
      } else {
        if (rightConnectorRef.current) rightConnectorRef.current.classList.remove("visible");
        if (bottomConnectorRef.current) bottomConnectorRef.current.classList.remove("visible");
        if (card4Ref.current) card4Ref.current.classList.remove("visible");
      }
    }

    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollHandler);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return (
    <>
      <nav>
        <div className="nav__logo">
          <Link href="#">
            <Image src="/logo.png" alt="logo" width={200} height={70} />
          </Link>
        </div>
        <ul className="nav__links">
          <li className="link">
            <Link href="#">Home</Link>
          </li>
          <li className="link">
            <Link href="#">Features</Link>
          </li>
          <li className="link">
            <Link href="#">How It Works</Link>
          </li>
          <li className="link">
            <Link href="#">About</Link>
          </li>
          <li className="link">
            <Link href="#">Community</Link>
          </li>
        </ul>
        <Link href="/login" className="btn">Join Now</Link>
      </nav>

      <header className="section__container header__container">
        <div className="header__content">
          <span className="bg__blur"></span>
          <span className="bg__blur header__blur"></span>
          <h4>YOUR PERSONAL AI FITNESS ECOSYSTEM</h4>
          <h1>
            <span>ADAPTIV</span>FIT
          </h1>
          <p>
            AdaptivFit is your personal AI fitness ecosystem — driven by intelligent agents. Each
            agent focuses on your unique needs — from posture, sleep, and digestion to recovery.
            They analyze your daily data and adjust workouts, nutrition, and routines in real time.
            No guessing, no generic plans — just precise, science-backed adaptation. Train, recover,
            and evolve — with AdaptivFit, your body&apos;s intelligent companion.
          </p>
          <Link href="/dashboard" className="btn">Get Started</Link>
        </div>
        <div className="header__image">
          {/* <img src="assets/header.png" alt="header" /> */}
        </div>
      </header>

      <section className="section__container explore__container">
        <div className="explore__header">
          <h2 className="section__header">INTELLIGENT AGENTS</h2>
          <div className="explore__nav">
            <span>
              <i className="ri-arrow-left-line"></i>
            </span>
            <span>
              <i className="ri-arrow-right-line"></i>
            </span>
          </div>
        </div>
        <div className="explore__grid">
          <div className="explore__card">
            <span>
              <i className="ri-camera-line"></i>
            </span>
            <h4>Posture Agent</h4>
            <p>
              Your intelligent posture companion watches every movement, analyzes form in real-time,
              and provides instant feedback to perfect your technique during every exercise.
            </p>
            <Link href="#">
              Learn More <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <div className="explore__card">
            <span>
              <i className="ri-moon-fill"></i>
            </span>
            <h4>Sleep Agent</h4>
            <p>
              Monitors your sleep patterns, recovery metrics, and circadian rhythms. Adjusts your
              daily routines and workout intensity based on your rest quality.
            </p>
            <Link href="#">
              Learn More <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <div className="explore__card">
            <span>
              <i className="ri-restaurant-fill"></i>
            </span>
            <h4>Digestion Agent</h4>
            <p>
              Tracks your nutrition intake and digestion health. Analyzes how your body responds to
              different foods and optimizes meal timing for peak performance.
            </p>
            <Link href="#">
              Learn More <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <div className="explore__card">
            <span>
              <i className="ri-heart-pulse-fill"></i>
            </span>
            <h4>Recovery Agent</h4>
            <p>
              Continuously analyzes your stress levels, fatigue markers, and recovery state. Adapts
              workouts and rest periods in real-time for optimal adaptation.
            </p>
            <Link href="#">
              Learn More <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </section>

      <section className="section__container class__container">
        <div className="class__image">
          <span className="bg__blur"></span>
          <div className="class__img-1">
            <Image src="/class1.png" alt="class" width={580} height={580} />
          </div>
        </div>
        <div className="class__content">
          <h2 className="section__header">INTELLIGENT FITNESS ADAPTATION</h2>
          <p>
            Each intelligent agent in AdaptivFit analyzes your daily data — workouts, sleep
            patterns, nutrition, digestion, and recovery metrics. They work together seamlessly,
            adjusting your routines in real-time based on your body&apos;s unique responses. No
            guessing, no generic plans. Every recommendation is precise, science-backed, and
            tailored to your individual needs. Train smarter, recover better, and evolve
            continuously with your body&apos;s intelligent companion.
          </p>
          <Link href="/login" className="btn">Start Your Journey</Link>
        </div>
      </section>

      <section className="section__container join__container" ref={joinSectionRef}>
        <h2 className="section__header">WHY ADAPTIVFIT ?</h2>
        <p className="section__subheader">
          Experience the power of intelligent agents that work together to understand your body.
          Each agent specializes in a unique aspect of your health, creating a complete ecosystem
          of adaptation.
        </p>
        <div className="join__grid-wrapper">
          <div className="join__grid">
            <div className="join__card" data-card="1" ref={card1Ref}>
              <div className="join__card__header">
                <div className="join__card__number">01</div>
                <div className="join__card__icon">
                  <i className="ri-brain-line"></i>
                </div>
              </div>
              <h4>Intelligent Agents</h4>
              <p>
                Specialized AI agents focus on posture, sleep, digestion, and recovery — each
                dedicated to your unique needs.
              </p>
            </div>
            <div className="join__card" data-card="2" ref={card2Ref}>
              <div className="join__card__header">
                <div className="join__card__number">02</div>
                <div className="join__card__icon">
                  <i className="ri-refresh-line"></i>
                </div>
              </div>
              <h4>Real-Time Adaptation</h4>
              <p>
                Agents analyze daily data and adjust workouts, nutrition, and routines instantly —
                no delays, no guesswork.
              </p>
            </div>
            <div className="join__card" data-card="3" ref={card3Ref}>
              <div className="join__card__header">
                <div className="join__card__number">03</div>
                <div className="join__card__icon">
                  <i className="ri-flask-line"></i>
                </div>
              </div>
              <h4>Science-Backed Precision</h4>
              <p>
                Every recommendation is precise, data-driven, and backed by science — tailored
                specifically to your body.
              </p>
            </div>
            <div className="join__card" data-card="4" ref={card4Ref}>
              <div className="join__card__header">
                <div className="join__card__number">04</div>
                <div className="join__card__icon">
                  <i className="ri-heart-pulse-line"></i>
                </div>
              </div>
              <h4>Continuous Evolution</h4>
              <p>
                Your fitness journey evolves with you. AdaptivFit learns and adapts continuously,
                ensuring optimal results over time.
              </p>
            </div>
            <div
              className="join__connector join__connector--horizontal join__connector--top"
              ref={topConnectorRef}
            ></div>
            <div
              className="join__connector join__connector--horizontal join__connector--bottom"
              ref={bottomConnectorRef}
            ></div>
            <div
              className="join__connector join__connector--vertical join__connector--left"
              ref={leftConnectorRef}
            ></div>
            <div
              className="join__connector join__connector--vertical join__connector--right"
              ref={rightConnectorRef}
            ></div>
          </div>
        </div>
      </section>

      <section className="section__container price__container">
        <h2 className="section__header">CHOOSE YOUR PLAN</h2>
        <p className="section__subheader">
          Select the perfect plan for your fitness journey. All plans include access to
          AdaptivFit&apos;s intelligent agent ecosystem.
        </p>
        <div className="price__grid">
          <div className="price__card">
            <div className="price__card__content">
              <h4>Starter Plan</h4>
              <h3>$19</h3>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Posture Agent access
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Basic workout tracking
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Essential health metrics
              </p>
            </div>
            <Link href="/login" className="btn price__btn">Get Started</Link>
          </div>
          <div className="price__card">
            <div className="price__card__content">
              <h4>Pro Plan</h4>
              <h3>$39</h3>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                All 4 intelligent agents
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Real-time adaptation
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Complete health tracking
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Science-backed recommendations
              </p>
            </div>
            <Link href="/login" className="btn price__btn">Get Started</Link>
          </div>
          <div className="price__card">
            <div className="price__card__content">
              <h4>Elite Plan</h4>
              <h3>$69</h3>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                All Pro features included
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Advanced analytics & insights
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Priority agent optimization
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                Custom goal programming
              </p>
              <p>
                <i className="ri-checkbox-circle-line"></i>
                24/7 intelligent companion
              </p>
            </div>
            <Link href="/login" className="btn price__btn">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="review">
        <div className="section__container review__container">
          <span>
            <i className="ri-double-quotes-r"></i>
          </span>
          <div className="review__content">
            <h4>USER REVIEW</h4>
            <p>
              AdaptivFit has completely transformed how I approach fitness. The intelligent agents
              work together seamlessly — my Posture Agent corrects my form in real-time, the Sleep
              Agent adjusts my workouts based on recovery, and the Digestion Agent optimizes my
              nutrition. Everything is precise and science-backed. No more guessing or generic
              plans. It&apos;s like having a team of specialists dedicated to my body, available
              24/7. Train, recover, and evolve — AdaptivFit truly is my body&apos;s intelligent
              companion.
            </p>
            <div className="review__rating">
              <span>
                <i className="ri-star-fill"></i>
              </span>
              <span>
                <i className="ri-star-fill"></i>
              </span>
              <span>
                <i className="ri-star-fill"></i>
              </span>
              <span>
                <i className="ri-star-fill"></i>
              </span>
              <span>
                <i className="ri-star-half-fill"></i>
              </span>
            </div>
            <div className="review__footer">
              <div className="review__member">
                <Image src="/logo.png" alt="member" width={60} height={60} />
                <div className="review__member__details">
                  <h4>Sarah Mitchell</h4>
                  <p>Fitness Enthusiast</p>
                </div>
              </div>
              <div className="review__nav">
                <span>
                  <i className="ri-arrow-left-line"></i>
                </span>
                <span>
                  <i className="ri-arrow-right-line"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}


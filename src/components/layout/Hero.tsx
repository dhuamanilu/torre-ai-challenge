import { useRef } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const item: Variants = {
        hidden: { y: 100, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 50,
                damping: 20,
            },
        },
    };

    return (
        <section ref={containerRef} className="hero-section">
            <motion.div
                style={{ y, opacity }}
                className="hero-content"
                initial="hidden"
                animate="show"
                variants={container}
            >
                <div className="hero-title-wrapper">
                    <motion.h1 variants={item} className="hero-title">
                        SKILL
                    </motion.h1>
                </div>
                <div className="hero-title-wrapper">
                    <motion.h1 variants={item} className="hero-title">
                        GAP
                    </motion.h1>
                </div>
                <div className="hero-title-wrapper">
                    <motion.h1 variants={item} className="hero-title highlight">
                        ANALYZER
                    </motion.h1>
                </div>

                <motion.p variants={item} className="hero-subtitle">
                    Bridge the gap between your talent and your dream job.
                </motion.p>
            </motion.div>
        </section>
    );
}

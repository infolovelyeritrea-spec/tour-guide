function MemoriesSection({ items }) {
  return (
    <section className="content-section memories-section">
      <div className="section-heading">
        <p className="eyebrow">Recent Memories</p>
        <h2>Moments Travelers Love Across Eritrea</h2>
      </div>
      <div className="memory-grid">
        {items.map((item) => (
          <article className="memory-card" key={item.id}>
            <img src={item.image_url} alt={item.title} />
            <div className="memory-overlay">
              <p>{item.location}</p>
              <h3>{item.title}</h3>
              <span>{item.description}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MemoriesSection;

function HeaderItem({ name, Icon, onClick }) {
  return (
    <div
      className="text-white flex items-center gap-3 text-[15px] font-semibold cursor-pointer hover:underline underline-offset-8"
      onClick={onClick}
    >
      <Icon />
      {name && <h2>{name}</h2>}
    </div>
  );
}

export default HeaderItem;
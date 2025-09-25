import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

const ArticleCard = ({ title, excerpt, imageUrl, onClick }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition min-h-[350px] min-w-[350px] flex flex-col justify-between">
      <div className="w-full h-48 mb-4 flex items-center justify-center relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
            <FontAwesomeIcon
              icon={faNewspaper}
              className="w-16 h-16 text-gray-400"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2 overflow-hidden text-ellipsis whitespace-normal">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-4 overflow-hidden text-ellipsis whitespace-normal flex-grow">
          {excerpt}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <button onClick={onClick} className="text-teal-600 hover:underline">
          Baca Selengkapnya
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;
